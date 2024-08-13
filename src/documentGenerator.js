import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import { saveAs } from "file-saver";
import logo from "./kigra.jpg"
const sampleLetter = (orgName, address) => {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "",
        }),
      ],
      spacing: {
        before: 1000,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "The Managing Director",
          bold: true,
          font: "Arial",
          size: 24,
        }),
        new TextRun({
          text: `\n${orgName}`,
          break: 1,
          font: "Arial",
          size: 24,
        }),
        new TextRun({
          text: `\n${address}`,
          break: 1,
          font: "Arial",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Dear Sir,",
          break: 2,
          font: "Arial",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "INTRODUCTION OF THE KANO INTEGRATED REVENUE MANAGEMENT SYSTEM (KIRMAS)",
          break: 1,
          bold: true,
          underline: true, // Added underline property
          font: "Arial",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "The Kano State Internal Revenue Service (KIRS) as part of its effort to simplify tax administration in the State, has introduced Kano Integrated Revenue Management System (KIRMAS) for ease of tax compliance.",
          break: 2,
          font: "Arial",
          size: 24,
        }),
        new TextRun({
          text: "KIRMAS enables seamless registration, filing and payment of taxes among other features. The KIRMAS also provides a single-view to Taxpayers for all transactions with the Service.",
          break: 2,
          font: "Arial",
          size: 24,
        }),
        new TextRun({
          text: "As one of our key taxpayers, you are kindly invited to note that effective 22nd July, 2024 all taxpayers are required to file and pay their taxes through the KIRMAS Platform. The platform offers a user-friendly interface, secure payment gateways, and a range of features designed to optimize the tax compliance experience.",
          break: 2,
          font: "Arial",
          size: 24,
        }),
        new TextRun({
          text: "Attached herewith is the user guide to assist you in familiarizing yourself with the system. Additionally, our customer support team will be available to address any inquiries and provide guidance as needed.",
          break: 2,
          font: "Arial",
          size: 24,
        }),
        new TextRun({
          text: "For further information and updates, please visit our official website at www.kirs.gov.ng or contact our dedicated support team via phone: 07035384184.",
          break: 2,
          font: "Arial",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Please accept the assurances of my highest regards.",
          break: 2,
          font: "Arial",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Zaid Abubakar, PhD",
          break: 1,
          bold: true,
          font: "Arial",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Executive Chairman",
          font: "Arial",
          size: 24,
        }),
      ],
    }),
  ];
};

export const generateDocument = async (orgName, address, imagePaths = []) => {
  try {
    const doc = new Document({
      sections: [
        
          {
            headers: {
                default: new Header({
                    children: [
                        new Table({
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: {
                                                size: 30,
                                                type: WidthType.PERCENTAGE,
                                            },
                                            children: [
                                                // Add logo
                                                Media.addImage(doc, logo, 100, 100), // Adjust size as needed
                                            ],
                                        }),
                                        new TableCell({
                                            width: {
                                                size: 70,
                                                type: WidthType.PERCENTAGE,
                                            },
                                            children: [
                                                new Paragraph({
                                                    text: "KANO STATE INTERNAL REVENUE SERVICE (KIRS)",
                                                    bold: true,
                                                    alignment: AlignmentType.CENTER,
                                                    font: "Arial",
                                                    size: 32, // 16 pt
                                                    color: "006400", // Green color
                                                }),
                                                new Paragraph({
                                                    text: "Revenue House, No. 2 Bank Road",
                                                    alignment: AlignmentType.CENTER,
                                                    font: "Arial",
                                                    size: 24, // 12 pt
                                                }),
                                                new Paragraph({
                                                    text: "tax@kirs.gov.ng | info@kirs.gov.ng | www.kirs.gov.ng",
                                                    alignment: AlignmentType.CENTER,
                                                    font: "Arial",
                                                    size: 24, // 12 pt
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                new Paragraph({
                    text: "Your document content goes here...",
                    spacing: { after: 200 }, // Adjust spacing after the paragraph
                }),
            ],
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            text: "Footer content here...",
                            alignment: AlignmentType.CENTER,
                            font: "Arial",
                            size: 24, // 12 pt
                        }),
                    ],
                }),
            },
        },
        ...sampleLetter(orgName, address),
      ],
    });

    // const doc = new Document({
    //   sections: [
    //     {
    //       properties: {},
    //       children: sampleLetter(orgName, address),
    //     },
    //   ],
    // });

    for (let i = 0; i < imagePaths.length; i++) {
      const imageUrl = imagePaths[i];
      const imageBlob = await fetch(imageUrl).then((response) =>
        response.blob()
      );

      doc.addSection({
        properties: {},
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBlob,
                transformation: {
                  width: 600,
                  height: 600,
                },
              }),
            ],
          }),
        ],
      });
    }

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Notification_Letter_${orgName}.docx`);
  } catch (error) {
    console.error("Error generating document:", error);
    // Handle errors or log them as needed
  }
};
