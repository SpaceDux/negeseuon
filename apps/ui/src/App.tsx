import { StrictMode } from "react";
import "@/globals.css";
import { Base } from "@/libs/components/Base";
import { type Connection } from "@/libs/components/Sidebar";
import { Home } from "@/views/Home";

function App() {
  const handleConnectionSelect = (connection: Connection) => {
    console.log("Selected connection:", connection);
    // TODO: Implement connection selection logic
  };

  const handleAddConnection = () => {
    console.log("Add connection clicked");
    // TODO: Implement add connection dialog/modal
  };

  const handleDisconnect = (connection: Connection) => {
    console.log("Disconnect connection:", connection);
    // TODO: Implement disconnect logic
  };

  const handleModifyConnection = (connection: Connection) => {
    console.log("Modify connection:", connection);
    // TODO: Implement modify connection dialog/modal
  };

  return (
    <StrictMode>
      <Base
        sidebarProps={{
          onConnectionSelect: handleConnectionSelect,
          onAddConnection: handleAddConnection,
          onDisconnect: handleDisconnect,
          onModifyConnection: handleModifyConnection,
        }}
      >
        <Home />
      </Base>
    </StrictMode>
  );
}

export default App;
