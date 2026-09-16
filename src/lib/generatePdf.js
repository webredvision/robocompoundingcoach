import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export const generateCalculatorsPDF = async (
    data,
    title,
    startDate,
    endDate,
    graphId,
    barGraphId,
    siteData
) => {
    const doc = new jsPDF();
    const websiteName = siteData?.websiteName || "";
    const email = siteData?.email || "";
    const mobile = siteData?.mobile || "";

    // 🔹 Load logo
    const logoImg = new Image();
    logoImg.src = "/logo.png";
    await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
    });

    // 🔹 Header
    doc.addImage(logoImg, "PNG", 14, 5, 35, 15);
    doc.setLineWidth(0.3);
    doc.line(14, 24, 200, 24);
    doc.line(60, 0, 60, 24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, 14, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${websiteName}`, 70, 11);
    doc.text(`${email} / ${mobile}`, 70, 16);
    doc.setLineWidth(0.4);
    doc.line(14, 38, 200, 38);

    // 🔹 Section Heading
    let yPosition = 47;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Investment Summary", 14, yPosition);
    yPosition += 5;

    // 🔹 Summary Boxes (auto layout)
    const boxWidth = 85;
    const boxHeight = 20;
    const marginY = 10;
    const startXLeft = 14;
    const startXRight = 110;

    const fields = (data.labels || []).map((label, index) => ({
        label,
        value:
            [
                data.totalInvestment,
                data.futureValue,
                data.sipInvestment,
                data.lumpsumInvestment,
                data.sipGrowth,
                data.sipFutureValue,
            ][index] || 0,
    }));
    const drawBox = (x, y, label, value) => {
        doc.setDrawColor(0);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, "S");

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(label, x + 5, y + 7);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Rs. ${Math.floor(value).toLocaleString("en-IN")}`, x + 5, y + 16);
    };

    // 🔹 Draw Boxes Dynamically
    for (let i = 0; i < fields.length; i++) {
        const x = i % 2 === 0 ? startXLeft : startXRight;
        if (i > 0 && i % 2 === 0) yPosition += boxHeight + marginY;
        drawBox(x, yPosition, fields[i].label, fields[i].value);
    }

    // Adjust yPosition for next section
    yPosition += boxHeight + 15;

    // 🔹 Graph Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Graphical Analysis", 14, yPosition);
    yPosition += 5;

    const captureGraph = async (elementId, x, y) => {
        const graphElement = document.getElementById(elementId);
        if (!graphElement) return 0;

        try {
            const canvas = await html2canvas(graphElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = 87;
            const imgHeight = 53;
            doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
            return imgHeight;
        } catch (err) {
            console.error("Error capturing chart:", err);
            return 0;
        }
    };

    const leftGraphHeight = await captureGraph(graphId, 14, yPosition + 5);
    const rightGraphHeight = await captureGraph(barGraphId, 110, yPosition + 5);
    yPosition += Math.max(leftGraphHeight, rightGraphHeight) + 20;

    // 🔹 Table Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Calculation Details", 14, yPosition);
    yPosition += 5;

    const columns = ["Parameter", "Value"];
    const rows = [
        ["Expected Inflation Rate (%)", "5"],
        ...fields.map((f) => [
            f.label,
            f.value?.toLocaleString("en-IN") || "N/A",
        ]),
    ];

    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [240, 240, 240], textColor: 0, halign: "left" },
        bodyStyles: { fillColor: [255, 255, 255], textColor: 0, halign: "left" },
    });

    // 🔹 Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
        "Note: This is an indicative calculation. Actual results may vary depending on market performance.",
        14,
        doc.internal.pageSize.height - 10
    );

    doc.save(`${title}.pdf`);
};

export const generatePDF = async (data, title, startDate, endDate, graphId, siteData) => {
    const doc = new jsPDF();
    const websiteName = siteData?.websiteName;
    const email = siteData?.email;
    const mobile = siteData?.mobile;

    // Load logo image
    const logoImg = new Image();
    logoImg.src = "/logo.png";

    await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = () => {
            console.error("Failed to load logo image");
            resolve(); // Continue even if logo fails
        };
    });

    let yPosition = 40;
    // Source Fund Section
    const sourceData = data.valuation || {};
    if (Object.keys(sourceData).length > 0) {
        doc.setFontSize(10);
        // Set bold font for title
        doc.setFont("helvetica", "bold");
        yPosition += 5; // Reduced from 10 to 5
        doc.text(title, 14, yPosition);
        doc.setFontSize(8);
        yPosition += 5; // Reduced from 10 to 5
        // Reset to normal font for the rest of the content
        doc.setFont("helvetica", "normal");

        const boxWidth = 25; // Reduced from 30 to 25 to fit seven boxes
        const boxHeight = 13;
        const marginX = 2;
        const startX = 14;

        // Single Row with seven boxes
        doc.rect(startX, yPosition, boxWidth, boxHeight); // Amount Invested
        doc.text("Amount Invested", startX + 2, yPosition + 4);
        doc.text(sourceData.investedAmount?.toString() || "N/A", startX + 2, yPosition + 11);

        doc.rect(startX + boxWidth + marginX, yPosition, boxWidth, boxHeight); // Current Value
        doc.text("Current Value", startX + boxWidth + marginX + 2, yPosition + 4);
        doc.text(sourceData.currentAssetValue?.toString() || "N/A", startX + boxWidth + marginX + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 2, yPosition, boxWidth, boxHeight); // Profit/Loss
        doc.text("Profit/Loss", startX + (boxWidth + marginX) * 2 + 2, yPosition + 4);
        doc.text(sourceData.pl?.toString() || "N/A", startX + (boxWidth + marginX) * 2 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 3, yPosition, boxWidth, boxHeight); // MONTHLY SIP
        doc.text("MONTHLY SIP", startX + (boxWidth + marginX) * 3 + 2, yPosition + 4);
        doc.text(sourceData.sipAmout?.toString() || "N/A", startX + (boxWidth + marginX) * 3 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 4, yPosition, boxWidth, boxHeight); // Current NAV
        doc.text("Current NAV", startX + (boxWidth + marginX) * 4 + 2, yPosition + 4);
        doc.text(sourceData.currentNav?.toString() || "N/A", startX + (boxWidth + marginX) * 4 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 5, yPosition, boxWidth, boxHeight); // Absolute Return(%)
        doc.text("Absolute Return", startX + (boxWidth + marginX) * 5 + 2, yPosition + 4);
        doc.text(sourceData.absoluteReturns?.toString() || "N/A", startX + (boxWidth + marginX) * 5 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 6, yPosition, boxWidth, boxHeight); // XIRR (%)
        doc.text("XIRR (%)", startX + (boxWidth + marginX) * 6 + 2, yPosition + 7);
        doc.text(sourceData.xirrRate?.toString() || "N/A", startX + (boxWidth + marginX) * 6 + 2, yPosition + 11);

        yPosition += boxHeight + 10; // Add 15mm gap before Destination Fund
    } else {
        console.warn("No valid source data available");
    }

    // Add logo
    doc.addImage(logoImg, "PNG", 14, 5, 40, 15); // Adjust x, y, width, height

    // Add title and metadata
    doc.setLineWidth(0.3);
    doc.line(14, 24, 200, 24);
    doc.setLineWidth(0.3);
    doc.line(60, 0, 60, 24);
    doc.setFontSize(10);
    doc.text(title, 14, 31);
    doc.setFontSize(10);
    doc.text(websiteName || "", 70, 11);
    doc.setFontSize(11);
    doc.text(`${email || ""} / ${mobile || ""}`, 70, 16);
    doc.text(`From: ${startDate} To: ${endDate}`, 14, 37);


    const graphElement = document.getElementById(graphId);
    let tableStartY = 40;
    // Default start position for table if no graph
    if (graphElement) {
        try {
            const canvas = await html2canvas(graphElement, {
                scale: 2, // Increase resolution
                useCORS: true, // Handle cross-origin issues
                backgroundColor: "#ffffff", // Ensure white background
            });
            const graphImgData = canvas.toDataURL("image/png");

            // Calculate image dimensions
            const img = new Image();
            img.src = graphImgData;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const imgWidth = 180; // Desired width in PDF (in mm)
            const imgAspectRatio = img.naturalHeight / img.naturalWidth;
            let imgHeight = imgWidth * imgAspectRatio; // Calculate height to maintain aspect ratio
            const maxImgHeight = 220; // Maximum height to fit on one page (in mm)

            // Apply maximum height constraint
            if (imgHeight > maxImgHeight) {
                imgHeight = maxImgHeight;
                // Optionally adjust width to maintain aspect ratio
                // imgWidth = imgHeight / imgAspectRatio;
            }

            // Add image with constrained dimensions
            doc.addImage(graphImgData, "PNG", 14, 70, imgWidth, imgHeight);
            tableStartY = 40 + imgHeight + 35;
        } catch (error) {
            console.error("Error capturing graph with html2canvas:", error);
        }
    } else {
        console.warn(`Graph element with ID ${graphId} not found`);
    }
    // Add table
    const columns = [
        "Date",
        "Nav",
        "Amt",
        "Unit",
        "Cumulative Unit",
        "Cumulative Amt",
        "Valuation",
    ];

    const rows = data && Array.isArray(data.sipData)
        ? data?.sipData?.map((item) => [
            item.navDate || "",
            item.nav || "",
            item.cashFlow || "",
            item.units || "",
            item.cumulitiveUnits || "",
            item.amount || "",
            item.currentValue || "",
        ])
        : [];

    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: tableStartY,
    });

    // Add footer
    doc.setFontSize(10);
    doc.text(
        "Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully.",
        14,
        doc.internal.pageSize.height - 10
    );

    // Save the PDF
    doc.save(`${title}.pdf`);
};

export const generateSwpPDF = async (data, title, startDate, endDate, graphId, withdrawalAmount, siteData) => {
    const doc = new jsPDF();
    const websiteName = siteData?.websiteName;
    const email = siteData?.email;
    const mobile = siteData?.mobile;

    // Load logo image
    const logoImg = new Image();
    logoImg.src = "/logo.png";

    await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = () => {
            console.error("Failed to load logo image");
            resolve(); // Continue even if logo fails
        };
    });
    let yPosition = 40;
    // Source Fund Section
    const sourceData = data || {};
    if (Object.keys(sourceData).length > 0) {
        doc.setFontSize(10);
        // Set bold font for title
        doc.setFont("helvetica", "bold");
        yPosition += 5; // Reduced from 10 to 5
        doc.text(title, 14, yPosition);
        doc.setFontSize(8);
        yPosition += 5; // Reduced from 10 to 5
        // Reset to normal font for the rest of the content
        doc.setFont("helvetica", "normal");

        const boxWidth = 30; // Adjusted to 30mm for six boxes
        const boxHeight = 13;
        const marginX = 2;
        const startX = 14;

        // Single Row with six boxes
        doc.rect(startX, yPosition, boxWidth, boxHeight); // Amount Invested
        doc.text("Amount Invested", startX + 2, yPosition + 4);
        doc.text(sourceData.initialAmount?.toString() || "N/A", startX + 2, yPosition + 11);

        doc.rect(startX + boxWidth + marginX, yPosition, boxWidth, boxHeight); // Monthly Withdrawl
        doc.text("Monthly Withdrawl", startX + boxWidth + marginX + 2, yPosition + 4);
        doc.text(sourceData.totalWithdrawlAmount?.toString() || "N/A", startX + boxWidth + marginX + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 2, yPosition, boxWidth, boxHeight); // Total Withdrawl (A)
        doc.text("Total", startX + (boxWidth + marginX) * 2 + 2, yPosition + 4);
        doc.text("Withdrawl (A)", startX + (boxWidth + marginX) * 2 + 2, yPosition + 8);
        doc.text(sourceData.totalWithdrawlAmount?.toString() || "N/A", startX + (boxWidth + marginX) * 2 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 3, yPosition, boxWidth, boxHeight); // Remaning Fund Value (B)
        doc.text("Remaning", startX + (boxWidth + marginX) * 3 + 2, yPosition + 4);
        doc.text("Fund Value (B)", startX + (boxWidth + marginX) * 3 + 2, yPosition + 8);
        doc.text(sourceData.fundRemaining?.toString() || "N/A", startX + (boxWidth + marginX) * 3 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 4, yPosition, boxWidth, boxHeight); // Total Portfolio Value (A+B)
        doc.text("Total Portfolio", startX + (boxWidth + marginX) * 4 + 2, yPosition + 4);
        doc.text("Value (A+B)", startX + (boxWidth + marginX) * 4 + 2, yPosition + 8);
        doc.text(sourceData.portFolioValue?.toString() || "N/A", startX + (boxWidth + marginX) * 4 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 5, yPosition, boxWidth, boxHeight); // XIRR (%)
        doc.text("XIRR (%)", startX + (boxWidth + marginX) * 5 + 2, yPosition + 7);
        doc.text(sourceData.xirrRate?.toString() || "N/A", startX + (boxWidth + marginX) * 5 + 2, yPosition + 11);

        yPosition += boxHeight + 10; // Add 15mm gap before Destination Fund
    } else {
        console.warn("No valid source data available");
    }
    // Add logo
    doc.addImage(logoImg, "PNG", 14, 5, 40, 15); // Adjust x, y, width, height

    // Add title and metadata
    doc.setLineWidth(0.3);
    doc.line(14, 24, 200, 24);
    doc.setLineWidth(0.3);
    doc.line(60, 0, 60, 24);
    doc.setFontSize(10);
    doc.text(title, 14, 31);
    doc.setFontSize(10);
    doc.text(websiteName || "", 70, 11);
    doc.setFontSize(11);
    doc.text(`${email || ""} / ${mobile || ""}`, 70, 16);
    doc.text(`From: ${startDate} To: ${endDate}`, 14, 37);

    const graphElement = document.getElementById(graphId);
    let tableStartY = 40; // Default start position for table if no graph
    if (graphElement) {
        try {
            const canvas = await html2canvas(graphElement, {
                scale: 2, // Increase resolution
                useCORS: true, // Handle cross-origin issues
                backgroundColor: "#ffffff", // Ensure white background
            });
            const graphImgData = canvas.toDataURL("image/png");

            // Calculate image dimensions
            const img = new Image();
            img.src = graphImgData;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const imgWidth = 180; // Desired width in PDF (in mm)
            const imgAspectRatio = img.naturalHeight / img.naturalWidth;
            let imgHeight = imgWidth * imgAspectRatio; // Calculate height to maintain aspect ratio
            const maxImgHeight = 220; // Maximum height to fit on one page (in mm)

            // Apply maximum height constraint
            if (imgHeight > maxImgHeight) {
                imgHeight = maxImgHeight;
                // Optionally adjust width to maintain aspect ratio
                // imgWidth = imgHeight / imgAspectRatio;
            }

            // Add image with constrained dimensions
            doc.addImage(graphImgData, "PNG", 14, 70, imgWidth, imgHeight);
            tableStartY = 40 + imgHeight + 35; // Adjust table position (add padding)
        } catch (error) {
            console.error("Error capturing graph with html2canvas:", error);
        }
    } else {
        console.warn(`Graph element with ID ${graphId} not found`);
    }

    const columns = [
        "Date",
        "Nav",
        "Cash Flow",
        "Unit",
        "Cumulative Unit",
        "Current Value",
        "Net Amount",
    ];
    const rows = data && Array.isArray(data.resData)
        ? data?.resData?.map((item) => [
            item.navDate || "",
            item.nav || "",
            item.cashFlow || "",
            item.units || "",
            item.cumulativeUnits || "",
            item.currentValue || "",
            item.netAmount || "",
        ])
        : [];

    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: tableStartY,
    });

    // Add footer
    doc.setFontSize(10);
    doc.text(
        "Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully.",
        14,
        doc.internal.pageSize.height - 10
    );

    // Save the PDF
    doc.save(`${title}.pdf`);
};

export const generateSchemePDF = async (data, title, startDate, endDate, graphId, siteData = {}) => {
    try {
        // Validate input data
        if (!data || !title || !startDate || !endDate || !graphId) {
            console.error("Missing required parameters for PDF generation");
            return;
        }

        const doc = new jsPDF();
        const websiteName = siteData?.websiteName || "Your Website";
        const email = siteData?.email || "example@email.com";
        const mobile = siteData?.mobile || "123-456-7890";

        // Load logo image
        const logoImg = new Image();
        logoImg.src = "/logo.png";

        await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = () => {
                console.warn("Failed to load logo image, proceeding without it");
                resolve(); // Continue even if logo fails to load
            };
        });
        let yPosition = 40;

        // Source Fund Section (using first object in data array)
        const sourceData = data[0] || {}; // Use data[0] as sourceData
        if (Object.keys(sourceData).length > 0) {
            doc.setFontSize(10);
            // Set bold font for title
            doc.setFont("helvetica", "bold");
            yPosition += 5; // Reduced from 10 to 5
            doc.text(sourceData.title || title, 14, yPosition); // Use fund title or provided title
            doc.setFontSize(8);
            yPosition += 5; // Reduced from 10 to 5
            // Reset to normal font for the rest of the content
            doc.setFont("helvetica", "normal");

            const boxWidth = 25; // Reduced from 30 to 25 to fit seven boxes
            const boxHeight = 13;
            const marginX = 2;
            const startX = 14;

            // Single Row with six boxes
            doc.rect(startX, yPosition, boxWidth, boxHeight); // Amount Invested
            doc.text("Amount Invested", startX + 2, yPosition + 4);
            doc.text(sourceData.investedAmount?.toString() || "N/A", startX + 2, yPosition + 11);

            doc.rect(startX + boxWidth + marginX, yPosition, boxWidth, boxHeight); // Current Value
            doc.text("Buy Units", startX + boxWidth + marginX + 2, yPosition + 4);
            doc.text(sourceData.buyUnit?.toString() || "N/A", startX + boxWidth + marginX + 2, yPosition + 11);

            doc.rect(startX + (boxWidth + marginX) * 2, yPosition, boxWidth, boxHeight); // Profit/Loss
            doc.text("Profit/Loss", startX + (boxWidth + marginX) * 2 + 2, yPosition + 4);
            doc.text(sourceData.maturityValue && sourceData?.investedAmount ? Math.floor(sourceData.maturityValue - sourceData.investedAmount)?.toString() : 0 || "N/A", startX + (boxWidth + marginX) * 2 + 2, yPosition + 11);

            doc.rect(startX + (boxWidth + marginX) * 3, yPosition, boxWidth, boxHeight); // MONTHLY SIP
            doc.text("Maturity Rate", startX + (boxWidth + marginX) * 3 + 2, yPosition + 4);
            doc.text(sourceData.RateAtMaturity?.toString() || "N/A", startX + (boxWidth + marginX) * 3 + 2, yPosition + 11);

            doc.rect(startX + (boxWidth + marginX) * 4, yPosition, boxWidth, boxHeight); // Current NAV
            doc.text("Maturity Value", startX + (boxWidth + marginX) * 4 + 2, yPosition + 4);
            doc.text(sourceData.maturityValue?.toString() || "N/A", startX + (boxWidth + marginX) * 4 + 2, yPosition + 11);

            doc.rect(startX + (boxWidth + marginX) * 5, yPosition, boxWidth, boxHeight); // Absolute Return(%)
            doc.text("Absolute Return", startX + (boxWidth + marginX) * 5 + 2, yPosition + 4);
            doc.text(sourceData.absoluteReturns?.toString() || "N/A", startX + (boxWidth + marginX) * 5 + 2, yPosition + 11);

            doc.rect(startX + (boxWidth + marginX) * 6, yPosition, boxWidth, boxHeight); // XIRR (%)
            doc.text("XIRR (%)", startX + (boxWidth + marginX) * 6 + 2, yPosition + 7);
            doc.text(sourceData.xirrRate?.toString() || "N/A", startX + (boxWidth + marginX) * 6 + 2, yPosition + 11);

            yPosition += boxHeight + 10; // Add 15mm gap before Destination Fund
        } else {
            console.warn("No valid source data available");
        }

        // Add logo if loaded successfully
        if (logoImg.complete && logoImg.naturalWidth !== 0) {
            doc.addImage(logoImg, "PNG", 14, 5, 40, 15);
        }

        // Add header elements
        doc.setLineWidth(0.3);
        doc.line(14, 24, 200, 24); // Horizontal line
        doc.line(60, 0, 60, 24); // Vertical line
        doc.setFontSize(10);
        doc.text(title, 14, 31);
        doc.setFontSize(10);
        doc.text(websiteName, 70, 11);
        doc.setFontSize(11);
        doc.text(`${email} / ${mobile}`, 70, 16);
        doc.text(`From: ${startDate} To: ${endDate}`, 14, 37);

        // Capture the graph as an image
        const graphElement = document.getElementById(graphId);
        let tableStartY = 40; // Default start position for table if no graph
        if (graphElement) {
            try {
                const canvas = await html2canvas(graphElement, {
                    scale: 2, // Increase resolution
                    useCORS: true, // Handle cross-origin issues
                    backgroundColor: "#ffffff", // Ensure white background
                });
                const graphImgData = canvas.toDataURL("image/png");

                // Calculate image dimensions
                const img = new Image();
                img.src = graphImgData;
                await new Promise((resolve) => {
                    img.onload = resolve;
                });

                const imgWidth = 180; // Desired width in PDF (in mm)
                const imgAspectRatio = img.naturalHeight / img.naturalWidth;
                let imgHeight = imgWidth * imgAspectRatio; // Calculate height to maintain aspect ratio
                const maxImgHeight = 220; // Maximum height to fit on one page (in mm)

                // Apply maximum height constraint
                if (imgHeight > maxImgHeight) {
                    imgHeight = maxImgHeight;
                    // Optionally adjust width to maintain aspect ratio
                    // imgWidth = imgHeight / imgAspectRatio;
                }

                // Add image with constrained dimensions
                doc.addImage(graphImgData, "PNG", 14, yPosition, imgWidth, imgHeight);
                tableStartY = yPosition + imgHeight + 10; // Adjust table position (add padding)
                yPosition += imgHeight + 10; // Update yPosition for next section
            } catch (error) {
                console.error("Error capturing graph with html2canvas:", error);
            }
        } else {
            console.warn(`Graph element with ID ${graphId} not found`);
        }

        // Prepare table data
        const columns = [
            "Invested Type",
            "Invested Amount",
            "Buy Rate",
            "Buy Units",
            "Maturity Date",
            "Maturity Rate",
            "Maturity Value",
            "Absolute Return",
            "XIRR (%)",
        ];

        // Ensure data is an array and map it correctly
        const rows = Array.isArray(data)
            ? data.map((item) => [
                item.title || "-",
                item.investedAmount?.toString() || "-",
                item.buyRate?.toString() || "-",
                item.buyUnit?.toString() || "-",
                item.maturityDate?.toString() || "-",
                item.RateAtMaturity?.toString() || "-",
                item.maturityValue?.toString() || "-",
                item.absoluteReturns?.toString() || "-",
                item.xirrRate?.toString() || "-",
            ])
            : [];

        // Generate table
        autoTable(doc, {
            head: [columns],
            body: rows,
            startY: tableStartY,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133] }, // Custom header color
            didDrawPage: () => {
                // Add footer disclaimer on each page
                doc.setFontSize(10);
                doc.text(
                    "Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully.",
                    14,
                    doc.internal.pageSize.height - 10,
                    { maxWidth: 180 }
                );
            },
        });

        // Save the PDF
        doc.save(`${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};

export const generateStpPDF = async (data, title, destinationTitle, startDate, endDate, graphId, siteData) => {
    if (!data) {
        console.error("Error: Data parameter is undefined. Cannot generate PDF with tables.");
        return;
    }



    const doc = new jsPDF();


    const websiteName = siteData?.websiteName || "Unknown Website";
    const email = siteData?.email || "N/A";
    const mobile = siteData?.mobile || "N/A";

    // Load logo image
    const logoImg = new Image();
    logoImg.src = "/logo.png";

    await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = () => {
            console.error("Failed to load logo image");
            resolve();
        };
    });

    // Add logo
    try {
        doc.addImage(logoImg, "PNG", 14, 5, 40, 15);
    } catch (error) {
        console.error("Error adding logo:", error);
    }

    // Add title and metadata
    doc.setLineWidth(0.3);
    doc.line(14, 24, 200, 24);
    doc.line(60, 0, 60, 24);
    doc.setFontSize(10);
    doc.text(title || "STP Report", 14, 31);
    doc.setFontSize(10);
    doc.text(websiteName, 70, 11);
    doc.setFontSize(11);
    doc.text(`${email} / ${mobile}`, 70, 16);
    doc.text(`From: ${startDate || "N/A"} To: ${endDate || "N/A"}`, 14, 37);

    let yPosition = 45;

    // Source Fund Section
    const sourceData = data.withdrawlingScheme || {};
    if (Object.keys(sourceData).length > 0) {
        doc.setFontSize(8);
        // Set bold font for title
        doc.setFont("helvetica", "bold");
        // Center "Source Fund" title
        doc.text("Source Fund", 14, yPosition);
        yPosition += 5; // Reduced from 10 to 5


        doc.text(title, 14, yPosition);
        yPosition += 5; // Reduced from 10 to 5

        // Reset to normal font for the rest of the content
        doc.setFont("helvetica", "normal");

        const boxWidth = 30;
        const boxHeight = 13;
        const marginX = 2;
        const startX = 14;

        // Single Row
        doc.rect(startX, yPosition, boxWidth, boxHeight); // Amount Invested
        doc.text("Amount Invested", startX + 2, yPosition + 4);
        doc.text(sourceData.initialAmount?.toString() || "N/A", startX + 2, yPosition + 11);

        doc.rect(startX + boxWidth + marginX, yPosition, boxWidth, boxHeight); // Monthly Transfer
        doc.text("Monthly Transfer", startX + boxWidth + marginX + 2, yPosition + 4);
        doc.text(sourceData.totalWithdrawlAmount?.toString() || "N/A", startX + boxWidth + marginX + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 2, yPosition, boxWidth, boxHeight); // Total Transfer
        doc.text("Total Transfer", startX + (boxWidth + marginX) * 2 + 2, yPosition + 4);
        doc.text((sourceData.totalWithdrawlAmount || 0).toString() || "N/A", startX + (boxWidth + marginX) * 2 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 3, yPosition, boxWidth, boxHeight); // Source Fund Balance
        doc.text("Source Fund Balance", startX + (boxWidth + marginX) * 3 + 2, yPosition + 4);
        doc.text(sourceData.fundRemaining?.toString() || "N/A", startX + (boxWidth + marginX) * 3 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 4, yPosition, boxWidth, boxHeight); // Transferred Amount + Balance
        doc.text("Transferred Amount +", startX + (boxWidth + marginX) * 4 + 2, yPosition + 4);
        doc.text("Balance", startX + (boxWidth + marginX) * 4 + 2, yPosition + 8);
        doc.text(sourceData.portFolioValue?.toString() || "N/A", startX + (boxWidth + marginX) * 4 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 5, yPosition, boxWidth, boxHeight); // XIRR (%)
        doc.text("XIRR (%)", startX + (boxWidth + marginX) * 5 + 2, yPosition + 7);
        doc.text(sourceData.xirrRate?.toString() || "N/A", startX + (boxWidth + marginX) * 5 + 2, yPosition + 11);

        yPosition += boxHeight + 10; // Add 15mm gap before Destination Fund
    } else {
        console.warn("No valid source data available");
    }

    // Destination Fund Section
    const destinationData = data.investedScheme.DestinationFundValuation || {};

    if (Object.keys(destinationData).length > 0) {
        doc.setFontSize(8);
        // Set bold font for title
        doc.setFont("helvetica", "bold");
        doc.text("Destination Fund", 14, yPosition);
        yPosition += 5;

        doc.text(destinationTitle, 14, yPosition);
        yPosition += 5;

        // Reset to normal font for the rest of the content
        doc.setFont("helvetica", "normal");

        const boxWidth = 30;
        const boxHeight = 13;
        const marginX = 2;
        const startX = 14;

        // Single Row
        doc.rect(startX, yPosition, boxWidth, boxHeight); // Installment Amount
        doc.text("Installment Amount", startX + 2, yPosition + 4);
        doc.text(destinationData.installmentAmount?.toString() || "N/A", startX + 2, yPosition + 11);

        doc.rect(startX + boxWidth + marginX, yPosition, boxWidth, boxHeight); // Amount Transferred for Month
        doc.text("Amount Transferred", startX + boxWidth + marginX + 2, yPosition + 4);
        doc.text("for Month", startX + boxWidth + marginX + 2, yPosition + 8);
        doc.text(destinationData.amountTransferFormonth?.toString() || "N/A", startX + boxWidth + marginX + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 2, yPosition, boxWidth, boxHeight); // Amount Invested
        doc.text("Amount Invested", startX + (boxWidth + marginX) * 2 + 2, yPosition + 4);
        doc.text(destinationData.amountInvested?.toString() || "N/A", startX + (boxWidth + marginX) * 2 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 3, yPosition, boxWidth, boxHeight); // Valuation on Maturity
        doc.text("Valuation on Maturity", startX + (boxWidth + marginX) * 3 + 2, yPosition + 4);
        doc.text(destinationData.valuationAsOnMaturity?.toString() || "N/A", startX + (boxWidth + marginX) * 3 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 4, yPosition, boxWidth, boxHeight); // Absolute Return (%)
        doc.text("Absolute Return (%)", startX + (boxWidth + marginX) * 4 + 2, yPosition + 4);
        doc.text(destinationData.absoluteReturns?.toString() || "N/A", startX + (boxWidth + marginX) * 4 + 2, yPosition + 11);

        doc.rect(startX + (boxWidth + marginX) * 5, yPosition, boxWidth, boxHeight); // XIRR (%)
        doc.text("XIRR (%)", startX + (boxWidth + marginX) * 5 + 2, yPosition + 7);
        doc.text(destinationData.xirrRate?.toString() || "N/A", startX + (boxWidth + marginX) * 5 + 2, yPosition + 11);

        yPosition += boxHeight + 10; // Add 10mm gap before graph
    } else {
        console.warn("No valid destination data available");
    }

    // Handle graph
    const graphElement = document.getElementById(graphId);
    if (graphElement) {
        try {
            const canvas = await html2canvas(graphElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });
            const graphImgData = canvas.toDataURL("image/png");
            const img = new Image();
            img.src = graphImgData;
            await new Promise((resolve) => (img.onload = resolve));

            const imgWidth = 180;
            const imgAspectRatio = img.naturalHeight / img.naturalWidth;
            let imgHeight = imgWidth * imgAspectRatio;
            const maxImgHeight = 150;

            if (imgHeight > maxImgHeight) {
                imgHeight = maxImgHeight;
            }

            doc.addImage(graphImgData, "PNG", 14, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
        } catch (error) {
            console.error("Error capturing graph:", error);
        }
    } else {
        console.warn(`Graph element with ID ${graphId} not found`);
    }

    // Define columns for detailed tables
    const columns = [
        "Date",
        "Nav",
        "Cash Flow",
        "Unit",
        "Cumulative Unit",
        "Current Value",
        "Net Amount",
    ];

    // Table 1: SIP Investment Details
    const sipRows = data?.investedScheme?.sipData && Array.isArray(data.investedScheme.sipData)
        ? data.investedScheme.sipData.map((item) => [
            item.navDate || "N/A",
            item.nav?.toString() || "0",
            item.cashFlow?.toString() || "0",
            item.units?.toString() || "0",
            item.cumulitiveUnits?.toString() || "0",
            item.currentValue?.toString() || "0",
            item.netAmount?.toString() || "0",
        ])
        : [];

    if (sipRows.length > 0) {
        doc.setFontSize(10);
        doc.text("Source Fund", 14, yPosition);
        doc.text(title, 14, yPosition + 5);
        yPosition += 10;

        try {
            doc.autoTable({
                head: [columns],
                body: sipRows,
                startY: yPosition,
                margin: { top: 10, left: 14, right: 14 },
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
                columnStyles: { 0: { cellWidth: 30 } },
            });
            yPosition = doc.lastAutoTable.finalY + 20;
        } catch (error) {
            console.error("Error rendering SIP table:", error);
        }
    } else {
        console.warn("No valid SIP data for table");
        doc.setFontSize(10);
        doc.text("No SIP Investment Data Available", 14, yPosition);
        yPosition += 20;
    }

    // Table 2: Withdrawal Details
    const withdrawalRows = data?.withdrawlingScheme?.resData && Array.isArray(data.withdrawlingScheme.resData)
        ? data.withdrawlingScheme.resData.map((item) => [
            item.navDate || "N/A",
            item.nav?.toString() || "0",
            item.cashFlow?.toString() || "0",
            item.units?.toString() || "0",
            item.cumulativeUnits?.toString() || "0",
            item.currentValue?.toString() || "0",
            item.netAmount?.toString() || "0",
        ])
        : [];

    if (withdrawalRows.length > 0) {
        doc.setFontSize(10);
        doc.text("Destination Fund", 14, yPosition);
        doc.text(destinationTitle, 14, yPosition + 5);
        yPosition += 10;

        try {
            doc.autoTable({
                head: [columns],
                body: withdrawalRows,
                startY: yPosition,
                margin: { top: 10, left: 14, right: 14 },
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
                columnStyles: { 0: { cellWidth: 30 } },
            });
        } catch (error) {
            console.error("Error rendering Withdrawal table:", error);
        }
    } else {
        console.warn("No valid withdrawal data for table");
        doc.setFontSize(10);
        doc.text("No Withdrawal Data Available", 14, yPosition);
        yPosition += 20;
    }

    // Add footer
    doc.setFontSize(10);
    const pageHeight = doc.internal.pageSize.height;
    if (yPosition > pageHeight - 20) {
        doc.addPage();
    }
    doc.text(
        "Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully.",
        14,
        pageHeight - 10
    );

    // Save the PDF
    try {
        doc.save(`${title || "report"}.pdf`);
    } catch (error) {
        console.error("Error saving PDF:", error);
    }
};