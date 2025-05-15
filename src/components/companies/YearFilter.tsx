interface YearFilterProps {
  year: number;
  onChange: (year: number) => void;
}

export const YearFilter = ({ year, onChange }: YearFilterProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex justify-center gap-2 mb-8">
      {years.map((y) => (
        <button
          key={y}
          onClick={() => onChange(y)}
          className={`px-4 py-2 rounded-md transition-colors ${
            year === y
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {y}년
        </button>
      ))}
    </div>
  );
};
