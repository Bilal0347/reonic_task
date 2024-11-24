import React, { useState } from "react";

interface HeatmapCalenderProps {
  startDate: string;
  endDate: string;
  dataValues: { date: string; count: number }[];
}

const HeatmapCalender = ({
  startDate,
  endDate,
  dataValues,
}: HeatmapCalenderProps) => {
  const [tooltip, setTooltip] = useState<string | null>(null); // State to handle tooltip

  let startingDate = new Date(startDate);
  let endingDate = new Date(endDate);
  const daysInMonth =
    Math.ceil(
      (endingDate.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  const calenderGrid = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(startingDate);
    date.setDate(startingDate.getDate() + i);
    return date.toISOString().slice(0, 10);
  });

  // Find the minimum and maximum count values
  const counts = dataValues.map((item) => item.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  // Normalize the count value
  const normalizeCount = (count: number): number => {
    return (count - minCount) / (maxCount - minCount);
  };

  // Assign color based on normalized count with a difference of 0.2 in intensity
  const getColorFromIntensity = (normalized: number): string => {
    const colorCodes = [
      "#FFEEEE", // 0.0
      "#FFDDDD", // 0.1
      "#FFCCCC", // 0.2
      "#FFBBBB", // 0.3
      "#FFAAAA", // 0.4
      "#FF9999", // 0.5
      "#FF8888", // 0.6
      "#FF7777", // 0.7
      "#FF6666", // 0.8
      "#FF5555", // 0.9
      "#FF4444", // 1.0
    ];

    // Calculate the color index based on the normalized value (0.0 to 1.0)
    const colorIndex = Math.min(
      Math.floor(normalized * 10), // Adjust to get 11 levels (0.0, 0.1, ..., 1.0)
      colorCodes.length - 1
    );

    return colorCodes[colorIndex];
  };

  // Show tooltip on hover or click
  const handleMouseEnter = (day: string, count: number) => {
    setTooltip(`Date: ${day} - Total Count: ${count}`);
  };

  const handleClick = (day: string, count: number) => {
    setTooltip(`Date: ${day} - Total Count: ${count}`);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Dynamically determine the number of rows based on screen size
  const getGridTemplateRows = () => {
    if (window.innerWidth > 768) {
      return `repeat(10, minmax(0, 1fr))`; // Desktop: 10 rows
    } else {
      return `repeat(23, minmax(0, 1fr))`; // Mobile: 25 rows
    }
  };

  const [gridTemplateRows, setGridTemplateRows] = useState(getGridTemplateRows);

  // Update grid dynamically when screen resizes
  React.useEffect(() => {
    const handleResize = () => {
      setGridTemplateRows(getGridTemplateRows());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center heatmapMain">
      <p className="text-1xl heatmapTitle">Heatmap of Events Per Day</p>
      {/* Legend */}
      <div className="flex justify-center mb-4">
        <span className="flex items-center mr-4">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 mr-2"></div>
          <span>No Activity</span>
        </span>
        <span className="flex items-center mr-4">
          <div
            className="w-4 h-4 mr-2"
            style={{ backgroundColor: getColorFromIntensity(0.5) }}
          ></div>
          <span>Moderate</span>
        </span>
        <span className="flex items-center">
          <div
            className="w-4 h-4 mr-2"
            style={{ backgroundColor: getColorFromIntensity(1) }}
          ></div>
          <span>High Activity</span>
        </span>
      </div>
      <div
        className="grid grid-flow-col gap-1 border rounded p-3 heatMapGrid"
        style={{ gridTemplateRows: gridTemplateRows }}
      >
        {calenderGrid.map((day, index) => {
          const activityCount =
            dataValues.find((item) => item.date === day)?.count || 0;

          // Normalize the activity count
          const normalized = normalizeCount(activityCount);
          const color = getColorFromIntensity(normalized);

          return (
            <div
              key={index}
              className="w-4 h-4 rounded cursor-pointer bg-gray-400"
              title={tooltip ?? ""} // Title shows dynamic tooltip when hovering
              style={{
                backgroundColor: `${
                  activityCount === 0 ? "#ffffff10" : String(color)
                }`,
              }}
              onMouseEnter={() => handleMouseEnter(day, activityCount)} // Mouse enter event
              onMouseLeave={handleMouseLeave} // Mouse leave event
              onClick={() => handleClick(day, activityCount)}
            >
              {/* Optional: Tooltip shown on the screen */}
              {tooltip && (
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#333",
                    color: "#fff",
                    padding: "5px",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  {tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatmapCalender;
