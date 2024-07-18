import React, { useEffect, useState } from "react";
import { generateDocument } from "./documentGenerator";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const NotificationLetter = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          "http://192.168.1.65:4559/get-org-letters"
        );
        const json = await response.json();
        setData(json.results[0]);
        setFilteredData(json.results[0]); // Initialize filtered data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    const results = data.filter((org) =>
      org.org_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, data]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages(imageUrls);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const chunkSize = 100; // Process 100 items at a time
    const totalChunks = Math.ceil(filteredData.length / chunkSize);
    const maxRetries = 3; // Maximum number of retries per chunk
    let processedChunks = 0; // Number of chunks processed successfully

    // Load progress from local storage if available
    const savedProgress = localStorage.getItem("downloadProgress");
    if (savedProgress) {
      processedChunks = JSON.parse(savedProgress);
    }

    for (let i = processedChunks; i < totalChunks; i++) {
      let success = false;
      let retries = 0;

      while (!success && retries < maxRetries) {
        try {
          const chunk = filteredData.slice(i * chunkSize, (i + 1) * chunkSize);
          const documentPromises = chunk.map(async (item) => {
            const blob = await generateDocument(
              item.org_name,
              item.address,
              []
            );
            zip.file(`Notification_Letter_${item.org_name}.docx`, blob);
          });

          await Promise.all(documentPromises);
          success = true;
          processedChunks++;
          localStorage.setItem(
            "downloadProgress",
            JSON.stringify(processedChunks)
          );
        } catch (error) {
          console.error(`Error processing chunk ${i}, retrying...`, error);
          retries++;
          if (retries === maxRetries) {
            alert(
              `Failed to process chunk ${i} after ${maxRetries} retries. Aborting.`
            );
            return;
          }
        }
      }
    }

    localStorage.removeItem("downloadProgress"); // Clear progress after successful download
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "Notification_Letters.zip");
  };

  // Pagination logic
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const paginatedData = filteredData.slice(startIndex, endIndex);
  // const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div>
      <div className="container">
        <div className="card">
          {/* {JSON.stringify(filteredData.length)} */}
          <div className="card-header">Notification Letter</div>
          <div className="card-body">
            <h1>Notification Letter</h1>
            <div className="row">
              <div className="col-md-6">
                <label>Search</label>
                <input
                  type="search"
                  placeholder="Search By Name"
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="imageUpload">Upload Additional Images:</label>
                <input
                  className="form-control"
                  type="file"
                  id="imageUpload"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="col-md-2 mt-4">
                <button className="btn btn-primary" onClick={handleDownloadAll}>
                  Download All
                </button>
              </div>
            </div>

            <div>
              <h5>
                {filteredData.length} Organization
                {filteredData.length !== 1 ? "s" : ""}
              </h5>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.org_name}</td>
                      <td>{item.address}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            generateDocument(
                              item.org_name,
                              item.address,
                              images.slice(0, 2)
                            )
                          }
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* <div className="pagination">
                <button
                  className="btn btn-primary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span className="mx-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-primary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationLetter;
