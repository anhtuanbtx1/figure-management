const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.CATALOG_PLAYWRIGHT_MODULE || 'playwright');

const baseURL = process.env.CATALOG_TEST_URL || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname)) {
  throw new Error('Run against a local development server only.');
}

// Browser-only fixtures: this regression test does not write database records.
const conditions = [
  { id: 1, name: 'Đau đầu', medications: [{ id: 11, conditionId: 1, name: 'Thuốc riêng', description: 'Mô tả A.' }] },
  { id: 2, name: 'Đau lưng', medications: [
    { id: 21, conditionId: 2, name: 'Thuốc chung', description: 'Mô tả B.' },
    { id: 22, conditionId: 2, name: 'Thuốc khác', description: 'Mô tả không khớp.' },
  ] },
  { id: 3, name: 'Viêm họng', medications: [{ id: 31, conditionId: 3, name: 'Thuốc chung', description: 'Mô tả C.' }] },
  { id: 4, name: 'Bệnh trống', medications: [] },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addCookies([{
      name: 'auth_token',
      value: Buffer.from(JSON.stringify({ username: 'user', role: 'user' })).toString('base64'),
      url: baseURL,
    }]);
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/medical-conditions', route => {
      assert.equal(route.request().method(), 'GET');
      return route.fulfill({ json: { success: true, data: conditions } });
    });
    await page.goto(baseURL + '/apps/medical-catalog', { waitUntil: 'domcontentloaded' });
    const search = page.getByRole('textbox', { name: 'Tìm theo bệnh hoặc thuốc' });
    const list = page.getByRole('list', { name: 'Danh sách bệnh' });
    const groups = page.getByRole('region', { name: /^Bệnh: / });
    const group = name => page.getByRole('region', { name: 'Bệnh: ' + name, exact: true });
    await group('Bệnh trống').waitFor();
    assert.equal(await groups.count(), 4, 'Default view includes every condition');
    await list.getByRole('button', { name: 'Đau đầu', exact: false }).click();
    await group('Đau đầu').waitFor();
    assert.equal(await groups.count(), 1);

    await search.fill('  THUOC CHUNG  ');
    await group('Viêm họng').waitFor();
    assert.equal(await groups.count(), 2, 'Search ignores selected condition');
    assert.equal(await group('Đau đầu').count(), 0);
    await group('Đau lưng').getByText('Mô tả B.', { exact: true }).waitFor();
    await group('Viêm họng').getByText('Mô tả C.', { exact: true }).waitFor();
    assert.equal(await page.getByText('Mô tả không khớp.', { exact: true }).count(), 0);

    await group('Viêm họng').getByRole('button', { name: 'Sửa thuốc Thuốc chung', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByText('Viêm họng', { exact: true }).waitFor();
    assert.equal(await dialog.getByLabel('Mô tả công dụng', { exact: false }).inputValue(), 'Mô tả C.');
    await dialog.getByRole('button', { name: 'Hủy', exact: true }).click();

    await page.getByRole('button', { name: 'Xóa tìm kiếm', exact: true }).click();
    await group('Đau đầu').waitFor();
    assert.equal(await groups.count(), 1, 'Clearing search restores previous selection');
    await search.fill('thuoc chung');
    await group('Viêm họng').waitFor();
    await list.getByRole('button', { name: 'Đau lưng', exact: false }).click();
    assert.equal(await search.inputValue(), '');
    await group('Đau lưng').getByText('Mô tả không khớp.', { exact: true }).waitFor();
    assert.equal(await groups.count(), 1, 'Explicit condition selection opens full details');

    await search.fill('dau');
    await group('Đau đầu').waitFor();
    assert.equal(await groups.count(), 2, 'Disease search displays all matching conditions');
    await group('Đau lưng').getByText('Mô tả không khớp.', { exact: true }).waitFor();
    await search.fill('benh trong');
    await group('Bệnh trống').getByText('Chưa có thuốc trong danh mục này.', { exact: true }).waitFor();
    assert.equal(await groups.count(), 1);
    await search.fill('khong-co-ket-qua');
    await page.getByRole('heading', { name: 'Không tìm thấy bệnh hoặc thuốc', exact: true }).waitFor();
    assert.equal(await groups.count(), 0);
    await list.getByRole('button', { name: 'Tất cả bệnh', exact: true }).click();
    await group('Bệnh trống').waitFor();
    assert.equal(await groups.count(), 4);
    assert.equal(await search.inputValue(), '');

    await search.fill('thuoc chung');
    await group('Viêm họng').waitFor();
    await page.screenshot({ path: path.join(os.tmpdir(), 'medical-search-all-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    assert.equal(await groups.count(), 2);
    await page.screenshot({ path: path.join(os.tmpdir(), 'medical-search-all-mobile.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS global search: all conditions by default, selected-condition independence, multiple drug matches, accents/case, correct edit parent, empty results, reset and mobile.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
