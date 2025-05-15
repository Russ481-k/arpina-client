import { Company } from "@/types/api";
import { CompanyCard } from "./CompanyCard";

interface CompanyListProps {
  companies: Company[];
  loading?: boolean;
  onCompanyClick?: (company: Company) => void;
}

export const CompanyList = ({
  companies,
  loading,
  onCompanyClick,
}: CompanyListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">등록된 입주기업이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.companyId}
          company={company}
          onClick={() => onCompanyClick?.(company)}
        />
      ))}
    </div>
  );
};
