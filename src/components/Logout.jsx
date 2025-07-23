import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="ml-2 text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
    >
      Logout
    </button>
  );
}

export default Logout;