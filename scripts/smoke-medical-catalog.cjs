const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { chromium, request } = require(process.env.CATALOG_PLAYWRIGHT_MODULE || 'playwright');

const baseURL = process.env.CATALOG_TEST_URL || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname)) {
  throw new Error('Run this smoke test against a local development server only.');
}
const token = Buffer.from(JSON.stringify({ username: 'user', role: 'user' })).toString('base64');
const prefix = 'QA-' + Date.now();
const ids = new Set();
const apiPath = '/api/medical-conditions';

async function main() {
  const api = await request.newContext({ baseURL, extraHTTPHeaders: { Cookie: 'auth_token=' + token }, timeout: 120000 });
  const anonymous = await request.newContext({ baseURL, timeout: 120000 });
  let browser;
  async function call(method, url, data, expected = 200) {
    const result = await api.fetch(url, { method, ...(data === undefined ? {} : { data }) });
    assert.equal(result.status(), expected, method + ' ' + url + ': ' + await result.text());
    const body = await result.json();
    return body.data;
  }
  try {
    assert.equal((await anonymous.get(apiPath)).status(), 401);
    await call('POST', apiPath, { name: '   ' }, 400);
    await call('POST', apiPath, { name: 'x'.repeat(201) }, 400);
    await call('POST', apiPath, null, 400);
    const first = await call('POST', apiPath, { name: prefix + ' Đau đầu' }, 201);
    ids.add(first.id);
    const second = await call('POST', apiPath, { name: prefix + ' Đau lưng' }, 201);
    ids.add(second.id);
    await call('POST', apiPath, { name: prefix.toLowerCase() + ' đau đầu' }, 409);
    await call('PUT', apiPath + '/invalid', { name: 'Test' }, 400);
    await call('PUT', apiPath + '/2147483647', { name: 'Test' }, 404);
    const medUrl = apiPath + '/' + first.id + '/medications';
    await call('POST', medUrl, { name: 'Paracetamol', description: '' }, 400);
    const med = await call('POST', medUrl, { name: 'Paracetamol', description: 'Mô tả công dụng dùng để kiểm thử.' }, 201);
    await call('POST', medUrl, { name: 'paracetamol', description: 'Duplicate test' }, 409);
    const shared = await call('POST', apiPath + '/' + second.id + '/medications', { name: 'Paracetamol', description: 'Mô tả của bệnh thứ hai.' }, 201);
    await call('PUT', apiPath + '/' + second.id + '/medications/' + med.id, { name: 'Wrong parent', description: 'Test' }, 404);
    await call('DELETE', apiPath + '/' + second.id + '/medications/' + med.id, undefined, 404);
    const updated = await call('PUT', medUrl + '/' + med.id, { name: 'Paracetamol', description: 'Công dụng đã cập nhật.' });
    assert.equal(updated.description, 'Công dụng đã cập nhật.');
    console.log('PASS API: session, validation, duplicates, CRUD, parent ownership.');

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addCookies([{ name: 'auth_token', value: token, url: baseURL }]);
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(baseURL + '/apps/medical-catalog', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('heading', { name: 'Bệnh & thuốc', exact: true }).waitFor();
    const search = page.getByRole('textbox', { name: 'Tìm theo bệnh hoặc thuốc' });
    const list = page.getByRole('list', { name: 'Danh sách bệnh' });
    await search.fill(prefix + ' dau dau');
    await list.getByText(prefix + ' Đau đầu', { exact: true }).waitFor();
    assert.equal(await list.getByText(prefix + ' Đau lưng', { exact: true }).count(), 0);
    await page.getByText('Công dụng đã cập nhật.', { exact: true }).waitFor();
    await search.fill('paracetamol');
    await list.getByText(prefix + ' Đau đầu', { exact: true }).waitFor();
    await list.getByText(prefix + ' Đau lưng', { exact: true }).waitFor();
    await search.fill('khong-co-ket-qua-' + prefix);
    await page.getByRole('heading', { name: 'Không tìm thấy bệnh hoặc thuốc' }).waitFor();
    await search.fill('');
    await page.getByRole('button', { name: 'Thêm bệnh', exact: true }).click();
    const editor = page.getByRole('dialog');
    await editor.getByLabel('Tên bệnh', { exact: false }).fill(prefix + ' Bệnh kiểm thử giao diện');
    await editor.getByRole('button', { name: 'Lưu', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    const created = (await call('GET', apiPath)).find(item => item.name === prefix + ' Bệnh kiểm thử giao diện');
    assert.ok(created);
    ids.add(created.id);
    await page.getByRole('button', { name: 'Thêm thuốc', exact: true }).click();
    await editor.getByLabel('Tên thuốc', { exact: false }).fill('Pharbacol');
    await editor.getByLabel('Mô tả công dụng', { exact: false }).fill('Mô tả nhập thử từ giao diện.');
    await editor.getByRole('button', { name: 'Lưu', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await page.getByText('Mô tả nhập thử từ giao diện.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Sửa thuốc Pharbacol', exact: true }).click();
    await editor.getByLabel('Mô tả công dụng', { exact: false }).fill('Mô tả đã sửa từ giao diện.');
    await editor.getByRole('button', { name: 'Lưu', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await search.fill(prefix + ' Bệnh kiểm thử giao diện');
    await page.getByText('Mô tả đã sửa từ giao diện.', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(os.tmpdir(), 'medical-catalog-desktop.png'), fullPage: true });
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.waitForFunction(() => document.documentElement.scrollWidth <= window.innerWidth + 1, null, { timeout: 5000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'No horizontal overflow at ' + width);
      await page.getByRole('button', { name: 'Thêm thuốc', exact: true }).click();
      await editor.getByLabel('Tên thuốc', { exact: false }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Dialog fits at ' + width);
      await editor.getByRole('button', { name: 'Hủy', exact: true }).click();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(os.tmpdir(), 'medical-catalog-mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Xóa thuốc Pharbacol', exact: true }).click();
    await editor.getByRole('button', { name: 'Hủy', exact: true }).click();
    await page.getByText('Mô tả đã sửa từ giao diện.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Xóa thuốc Pharbacol', exact: true }).click();
    await editor.getByRole('button', { name: 'Xóa', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await page.getByText('Chưa có thuốc trong danh mục này.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Sửa tên bệnh', exact: true }).click();
    await editor.getByLabel('Tên bệnh', { exact: false }).fill(prefix + ' Bệnh đã đổi tên');
    await editor.getByRole('button', { name: 'Lưu', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    await page.getByRole('heading', { name: prefix + ' Bệnh đã đổi tên', exact: true, level: 2 }).waitFor();
    await page.getByRole('button', { name: 'Xóa bệnh', exact: true }).click();
    await editor.getByRole('button', { name: 'Xóa', exact: true }).click();
    await editor.waitFor({ state: 'hidden' });
    ids.delete(created.id);
    assert.equal((await call('GET', apiPath)).some(item => item.id === created.id), false);
    assert.deepEqual(pageErrors, []);
    console.log('PASS UI: create/edit/delete, cancel, persistence, accent-insensitive search, drug search, empty results, desktop/mobile.');

    await call('DELETE', apiPath + '/' + first.id);
    ids.delete(first.id);
    const remaining = await call('GET', apiPath);
    assert.equal(remaining.some(item => item.id === first.id), false);
    assert.ok(remaining.find(item => item.id === second.id).medications.some(item => item.id === shared.id));
    await call('DELETE', medUrl + '/' + med.id, undefined, 404);
    console.log('PASS cascade deletion preserves medication in other conditions.');
  } finally {
    // Delete only records created by this run, including a UI record if its assertion failed.
    const remaining = await call('GET', apiPath).catch(() => []);
    for (const item of remaining) if (item.name.startsWith(prefix)) ids.add(item.id);
    for (const id of ids) await call('DELETE', apiPath + '/' + id).catch(error => console.error('Cleanup failed:', error.message));
    if (browser) await browser.close();
    await api.dispose();
    await anonymous.dispose();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
