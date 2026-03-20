"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Image from "next/image";

interface LeaveRequestDashboardCardProps {
  title: string;
  username: string;
  val: string;
  subtitle: string;
  imgSrc: string;
}

const LeaveRequestDashboardCard = ({
  title,
  username,
  val,
  subtitle,
  imgSrc,
}: LeaveRequestDashboardCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: (theme) => theme.palette.primary.light,
        py: 0,
        position: "relative",
      }}
    >
      <CardContent sx={{ py: 3, px: 2 }}>
        <Grid container justifyContent="space-between">
          <Grid item sm={6} display="flex" alignItems="center">
            <Box>
              <Box mb={2}>
                <Typography variant="h5" whiteSpace="nowrap">
                  {title}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" whiteSpace="nowrap">
                  Hello {username}
                </Typography>
              </Box>

              <Stack
                mt={4}
                spacing={2}
                direction="row"
              >
                <Box>
                  <Typography variant="h2" whiteSpace="nowrap">
                    {val}
                  </Typography>
                  <Typography variant="subtitle1" whiteSpace="nowrap">
                    {subtitle}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
          <Grid item sm={6}>
            <Box
              sx={{
                width: "150px",
                height: "150px",
                position: "absolute",
                right: "10px",
                bottom: "-10px",
                marginTop: "20px",
                opacity: 0.8
              }}
            >
              <Image src={imgSrc} alt="dash-bg" width={150} height={150} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestDashboardCard;
