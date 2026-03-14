import { generateApproxChart, generateStyledChart, ChartStyle, DEFAULT_STYLE } from "../natalChart";
import fs from "fs";

export const testNatalChart = () => {
    const chart = generateApproxChart({
        datetime: new Date("2002-11-12T18:45:00Z"),
        lat: 41.0082,
        lng: 28.9784,
    });

    console.log("Generated Chart Data:", JSON.stringify(chart, null, 2));

    // Customize the chart style - you can now easily modify these properties
    const customStyle: ChartStyle = {
        size: 1000,
        backgroundColor: "#0a0015",        // Deep purple/black background
        starry: true,
        starCount: 400,
        primaryRingColor: "#d4af37",       // Golden color
        secondaryRingColor: "#8b6914",     // Darker gold
        accentColor: "#ff1493",            // Deep pink
        zodiacTextColor: "#ffd700",        // Bright gold
        bodyIconSize: 20,
        useGradients: true,
        glowEffect: true,
    };

    // Generate the styled SVG
    const svgContent = generateStyledChart(chart, customStyle);

    // Save to file
    fs.writeFileSync("./birth_chart_styled.svg", svgContent);
    console.log("Styled natal chart saved to: birth_chart_styled.svg");
};

testNatalChart();
