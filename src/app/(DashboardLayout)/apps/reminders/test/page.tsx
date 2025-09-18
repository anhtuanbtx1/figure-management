"use client";
import React, { useState } from "react";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import {
  Box,
  Button,
  CardContent,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import { IconBug, IconCheck, IconX } from "@tabler/icons-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const TestAPIPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testEndpoint = async (endpoint: string, method: string = "GET", body?: any) => {
    setLoading(true);
    const testStart = Date.now();
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, options);
      const responseTime = Date.now() - testStart;
      const data = await response.json();
      
      const result = {
        endpoint,
        method,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        responseTime,
        data: data,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setResults(prev => [result, ...prev]);
      return result;
    } catch (error: any) {
      const result = {
        endpoint,
        method,
        status: 0,
        statusText: "Network Error",
        success: false,
        responseTime: Date.now() - testStart,
        data: { error: error.message },
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setResults(prev => [result, ...prev]);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    
    // Test các endpoint chính
    await testEndpoint("/api/reminders");
    await testEndpoint("/api/reminders/categories");
    await testEndpoint("/api/reminders/templates");
    await testEndpoint("/api/telegram/settings");
    await testEndpoint("/api/scheduler/status");
    
    // Test POST endpoint
    await testEndpoint("/api/reminders/test/notification", "POST", {
      title: "Test từ Frontend",
      description: "Test API connection từ Next.js frontend",
    });
  };

  return (
    <PageContainer title="Test API Connection" description="Kiểm tra kết nối API">
      <BlankCard>
        <CardContent>
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">
                <IconBug size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
                Test API Connection
              </Typography>
              <Button
                variant="contained"
                onClick={runAllTests}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <IconCheck />}
              >
                {loading ? "Testing..." : "Run All Tests"}
              </Button>
            </Stack>

            {/* API Info */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  API Configuration
                </Typography>
                <Typography variant="body1">
                  <strong>API URL:</strong> {API_URL}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đảm bảo backend đang chạy trên port 3002
                </Typography>
              </Stack>
            </Paper>

            {/* Test Results */}
            {results.length > 0 && (
              <>
                <Divider />
                <Typography variant="h6">Test Results</Typography>
                <Stack spacing={2}>
                  {results.map((result, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 2,
                        borderLeft: 4,
                        borderColor: result.success ? "success.main" : "error.main",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {result.success ? (
                              <IconCheck size={20} color="green" />
                            ) : (
                              <IconX size={20} color="red" />
                            )}
                            <Typography variant="subtitle1" fontWeight="bold">
                              {result.method} {result.endpoint}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Status: {result.status} {result.statusText}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Response Time: {result.responseTime}ms
                          </Typography>
                          {result.data && (
                            <Box mt={1}>
                              <Typography variant="caption" color="text.secondary">
                                Response Data:
                              </Typography>
                              <Paper elevation={0} sx={{ p: 1, bgcolor: "grey.100", mt: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  component="pre"
                                  sx={{
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {JSON.stringify(result.data, null, 2).slice(0, 500)}
                                  {JSON.stringify(result.data).length > 500 && "..."}
                                </Typography>
                              </Paper>
                            </Box>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {result.timestamp}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}

            {results.length === 0 && !loading && (
              <Alert severity="info">
                Click "Run All Tests" để kiểm tra kết nối với backend API
              </Alert>
            )}
          </Stack>
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
};

export default TestAPIPage;