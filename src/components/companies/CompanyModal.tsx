import { Company } from "@/types/api";
import Image from "next/image";
import { Building2, X } from "lucide-react";

interface CompanyModalProps {
  company: Company;
  onClose: () => void;
}

export const CompanyModal = ({ company, onClose }: CompanyModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative">
                {company.logoFileId ? (
                  <Image
                    src={`/api/v1/file/${company.logoFileId}`}
                    alt={company.companyName}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <Building2 size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{company.companyName}</h2>
                {company.tagline && (
                  <p className="text-gray-600">{company.tagline}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {company.ceoName && (
              <div>
                <h3 className="text-sm text-gray-500">대표이사</h3>
                <p>{company.ceoName}</p>
              </div>
            )}
            {company.foundedDate && (
              <div>
                <h3 className="text-sm text-gray-500">설립일</h3>
                <p>{company.foundedDate}</p>
              </div>
            )}
            {company.industry && (
              <div>
                <h3 className="text-sm text-gray-500">산업분류</h3>
                <p>{company.industry}</p>
              </div>
            )}
            {company.location && (
              <div>
                <h3 className="text-sm text-gray-500">위치</h3>
                <p>{company.location}</p>
              </div>
            )}
          </div>

          {company.summaryHtml && (
            <div className="prose max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: company.summaryHtml }} />
            </div>
          )}

          {company.homepageUrl && (
            <a
              href={company.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              홈페이지 방문
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
