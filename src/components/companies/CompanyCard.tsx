import { Company } from "@/types/api";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

export const CompanyCard = ({ company, onClick }: CompanyCardProps) => {
  return (
    <div
      className="group relative flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="w-24 h-24 mb-4 relative">
        {company.logoFileId ? (
          <Image
            src={`/api/v1/file/${company.logoFileId}`}
            loader={() =>
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/file/${company.logoFileId}`
            }
            alt={company.companyName}
            fill
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <Building2 size={32} className="text-gray-400" />
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-center mb-2">
        {company.companyName}
      </h3>

      {company.tagline && (
        <p className="text-sm text-gray-600 text-center mb-4">
          {company.tagline}
        </p>
      )}

      {company.homepageUrl && (
        <a
          href={company.homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          홈페이지
        </a>
      )}
    </div>
  );
};
