import Link from "next/link";
import { FaWhatsapp, FaFacebook, FaYoutube, FaLinkedin } from "react-icons/fa";

export default function SocialIcons() {
  return (
    <div className="flex gap-5 mt-10">
      
      {/* WhatsApp */}
      <Link
        href="https://wa.me/8801723220778"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="p-2 bg-green-600 text-white rounded-lg cursor-pointer text-2xl">
          <FaWhatsapp />
        </div>
      </Link>

      {/* Facebook */}
      <Link
        href="https://www.facebook.com/Islamidawahinstitutetushbhander"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="p-2 bg-blue-600 text-white rounded-lg cursor-pointer text-2xl">
          <FaFacebook />
        </div>
      </Link>

      {/* YouTube */}
      <Link
        href="https://youtube.com/@YourChannel"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="p-2 bg-red-500 text-white rounded-lg cursor-pointer text-2xl">
          <FaYoutube />
        </div>
      </Link>

      {/* LinkedIn */}
      <Link
        href="https://linkedin.com/company/YourCompany"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="p-2 bg-blue-900 text-white rounded-lg cursor-pointer text-2xl">
          <FaLinkedin />
        </div>
      </Link>

    </div>
  );
}
