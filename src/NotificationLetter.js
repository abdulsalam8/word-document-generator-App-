import React, { useEffect, useState } from "react";
import { generateDocument } from "./documentGenerator";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const NotificationLetter = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("http://localhost:4559/get-org-letters");
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

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const documentPromises = filteredData.map(async (item, index) => {
      const blob = await generateDocument(item.org_name, item.address, []);
      zip.file(`Notification_Letter_${item.org_name}.docx`, blob);
    });

    await Promise.all(documentPromises);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "Notification_Letters.zip");
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="container">
        <div className="card">
          <div className="card-header">Notification Letter</div>
          <div className="card-body">
            <h1>Notification Letter</h1>
            <div className="row">
              <div className="col-md-8">
                <label>Search</label>
                <input
                  type="search"
                  placeholder="Search By Name"
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4 mt-4">
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
              <table className="table bordered stripped">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.org_name}</td>
                      <td>{item.address}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            generateDocument(item.org_name, item.address, [])
                          }
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <nav aria-label="Page navigation example">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      aria-label="Previous"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <span aria-hidden="true">&laquo;</span>
                      <span className="sr-only">Previous</span>
                    </a>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </a>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      aria-label="Next"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <span aria-hidden="true">&raquo;</span>
                      <span className="sr-only">Next</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationLetter;
