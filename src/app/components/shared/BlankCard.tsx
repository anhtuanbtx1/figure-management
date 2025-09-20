import { Card, CardContent, SxProps, Theme } from "@mui/material";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
};

const BlankCard = ({ children, className, sx }: Props) => {
  return (
    <Card
      sx={{
        p: 0,
        position: "relative",
        // Ensure the card's background color is inherited from the theme
        backgroundColor: "transparent", 
        boxShadow: "none",
        ...sx,
      }}
      className={className}
      elevation={0}
      variant={"outlined"}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default BlankCard;
