import React from "react";

interface TLogoIconProps {
  color?: string;
  size?: number;
}

const TLogoIcon: React.FC<TLogoIconProps> = ({
  color = "#000000",
  size = 24,
}) => {
  return {
    tasks: {
      import: {
        operation: "import/upload",
      },
      convert: {
        operation: "convert",
        input: "import",
        input_format: "png",
        output_format: "svg",
        options: {
          "color-mode": "color",
          clustering: "stacked",
          "color-precision": 6,
          "gradient-step": 16,
          "filter-speckle": 4,
          "curve-fitting": "spline",
          "segment-length": 4,
          "corner-threshold": 60,
          "splice-threshold": 45,
        },
      },
      "export-url": {
        operation: "export/url",
        input: ["convert"],
      },
    },
  };
};

export default TLogoIcon;