import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json", // ⬅ PENTING
        },
        body: JSON.stringify({
          // name,
          whatsapp,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Register gagal");
      }

      await res.json();

      alert("Registrasi berhasil, silakan login");
      navigate("/auth/login");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      alert("Registrasi gagal. Periksa data atau server backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nama Lengkap"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        type="whatsapp"
        placeholder="No Whatsapp"
        required
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        type="password"
        placeholder="Password (min 6 karakter)"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50">
        {loading ? "Memproses..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
