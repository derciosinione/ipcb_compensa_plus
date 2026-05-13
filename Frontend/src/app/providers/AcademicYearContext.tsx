import React, { createContext, useContext, useEffect, useState } from "react";
import type { AcademicYear } from "../services/academicYears/academicYearTypes";
import { getActiveAcademicYear, listAcademicYears } from "../services/academicYears/academicYearsApi";

interface AcademicYearContextType {
  selectedYear: AcademicYear | null;
  academicYears: AcademicYear[];
  isLoading: boolean;
  setSelectedYearId: (id: string) => void;
  refresh: () => Promise<void>;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export const AcademicYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [years, active] = await Promise.all([
        listAcademicYears(),
        getActiveAcademicYear()
      ]);
      
      setAcademicYears(years);
      
      // Try to get stored preference
      const storedYearId = localStorage.getItem("selected-academic-year-id");
      const storedYear = years.find(y => y.id === storedYearId);
      
      if (storedYear) {
        setSelectedYear(storedYear);
      } else if (active) {
        setSelectedYear(active);
        localStorage.setItem("selected-academic-year-id", active.id);
      } else if (years.length > 0) {
        setSelectedYear(years[0]);
        localStorage.setItem("selected-academic-year-id", years[0].id);
      }
    } catch (error) {
      console.error("Failed to load academic years:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setSelectedYearId = (id: string) => {
    const year = academicYears.find(y => y.id === id);
    if (year) {
      setSelectedYear(year);
      localStorage.setItem("selected-academic-year-id", id);
    }
  };

  return (
    <AcademicYearContext.Provider
      value={{
        selectedYear,
        academicYears,
        isLoading,
        setSelectedYearId,
        refresh: loadData
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
};

export const useAcademicYear = () => {
  const context = useContext(AcademicYearContext);
  if (context === undefined) {
    throw new Error("useAcademicYear must be used within an AcademicYearProvider");
  }
  return context;
};
