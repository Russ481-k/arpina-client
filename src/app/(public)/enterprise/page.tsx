"use client";

import { useState } from "react";
import { Company } from "@/types/api";
import { useCompanies } from "@/lib/hooks/useCompany";
import { CompanyList } from "@/components/companies/CompanyList";
import { YearFilter } from "@/components/companies/YearFilter";
import { CompanyModal } from "@/components/companies/CompanyModal";

export default function CompaniesPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { data, isLoading } = useCompanies({
    year: selectedYear,
    displayYn: true,
  });

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">입주기업</h1>

      <YearFilter year={selectedYear} onChange={setSelectedYear} />

      <CompanyList
        companies={Array.isArray(data?.data) ? data.data : []}
        loading={isLoading}
        onCompanyClick={handleCompanyClick}
      />

      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
