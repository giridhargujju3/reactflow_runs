import React, { useEffect, useState } from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

/**
 * IMPORTANT:
 * Backend must be reachable from browser
 */
const BACKEND = "http://localhost:4000";

export default function App() {
  /* ================= STATE ================= */
  const [users, setUsers] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [rtls, setRtls] = useState([]);
  const [runs, setRuns] = useState([]);
  const [csv, setCsv] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDesign, setSelectedDesign] = useState("");
  const [selectedRtl, setSelectedRtl] = useState("");

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    fetch(`${BACKEND}/api/users`)
      .then(res => res.json())
      .then(data => {
        console.log("USERS FROM API:", data); // 🔥 DEBUG
        setUsers(data);
      })
      .catch(err => {
        console.error("FAILED TO LOAD USERS", err);
      });
  }, []);

  /* ================= LOAD DESIGNS ================= */
  useEffect(() => {
    setDesigns([]);
    setSelectedDesign("");
    setRtls([]);
    setSelectedRtl("");
    setRuns([]);
    setCsv([]);

    if (!selectedUser) return;

    fetch(`${BACKEND}/api/designs/${selectedUser}`)
      .then(res => res.json())
      .then(setDesigns)
      .catch(console.error);
  }, [selectedUser]);

  /* ================= LOAD RTLS ================= */
  useEffect(() => {
    setRtls([]);
    setSelectedRtl("");
    setRuns([]);
    setCsv([]);

    if (!selectedUser || !selectedDesign) return;

    fetch(`${BACKEND}/api/rtls/${selectedUser}/${selectedDesign}`)
      .then(res => res.json())
      .then(setRtls)
      .catch(console.error);
  }, [selectedUser, selectedDesign]);

  /* ================= LOAD RUNS ================= */
  useEffect(() => {
    setRuns([]);
    setCsv([]);

    if (!selectedUser || !selectedDesign || !selectedRtl) return;

    fetch(
      `${BACKEND}/api/runs/${selectedUser}/${selectedDesign}/${selectedRtl}`
    )
      .then(res => res.json())
      .then(setRuns)
      .catch(console.error);
  }, [selectedUser, selectedDesign, selectedRtl]);

  /* ================= GRAPH NODES ================= */
  const nodes = [
    ...(selectedDesign
      ? [{
          id: "design",
          data: { label: selectedDesign },
          position: { x: 350, y: 40 },
          style: {
            border: "2px solid #333",
            padding: 10,
            fontWeight: "bold"
          }
        }]
      : []),

    ...rtls.map((rtl, i) => ({
      id: rtl,
      data: { label: rtl },
      position: { x: i * 200, y: 180 },
      style: {
        border: "1px solid #666",
        padding: 8,
        cursor: "pointer"
      }
    })),

    ...runs.map((run, i) => ({
      id: `${selectedRtl}:${run}`,
      data: { label: run },
      position: { x: i * 200, y: 340 },
      style: {
        border: "1px solid #999",
        padding: 6,
        cursor: "pointer"
      }
    }))
  ];

  /* ================= GRAPH EDGES ================= */
  const edges = [
    ...rtls.map(rtl => ({
      id: `e-design-${rtl}`,
      source: "design",
      target: rtl
    })),

    ...runs.map(run => ({
      id: `e-${selectedRtl}-${run}`,
      source: selectedRtl,
      target: `${selectedRtl}:${run}`
    }))
  ];

  /* ================= NODE CLICK ================= */
  const onNodeClick = (_, node) => {
    // RTL clicked → load runs
    if (rtls.includes(node.id)) {
      setSelectedRtl(node.id);
      return;
    }

    // Run clicked → load CSV
    if (node.id.includes(":")) {
      const run = node.id.split(":")[1];

      fetch(
        `${BACKEND}/api/pd-main/${selectedUser}/${selectedDesign}/${selectedRtl}/${run}`
      )
        .then(res => res.json())
        .then(setCsv)
        .catch(console.error);
    }
  };

  /* ================= UI ================= */
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{ width: "65%", display: "flex", flexDirection: "column" }}>
        {/* CONTROLS */}
        <div
          style={{
            padding: 10,
            background: "#f5f5f5",
            borderBottom: "1px solid #ccc"
          }}
        >
          <label>User:&nbsp;</label>
          <select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
          >
            <option value="">Select User</option>

            {users.length === 0 && (
              <option disabled>Loading users...</option>
            )}

            {users.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          <label style={{ marginLeft: 20 }}>Design:&nbsp;</label>
          <select
            value={selectedDesign}
            onChange={e => setSelectedDesign(e.target.value)}
            disabled={!selectedUser}
          >
            <option value="">Select Design</option>
            {designs.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* GRAPH */}
        <div style={{ flexGrow: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            fitView
            key={`${selectedUser}-${selectedDesign}-${selectedRtl}`}
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: "35%",
          padding: 10,
          overflow: "auto",
          borderLeft: "1px solid #ccc"
        }}
      >
        <h3>pd_main.csv</h3>

        {csv.length === 0 ? (
          <p>No run selected</p>
        ) : (
          <table border="1" width="100%">
            <tbody>
              {csv.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

