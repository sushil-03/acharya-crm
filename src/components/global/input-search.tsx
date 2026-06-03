import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

const InputSearch = ({
  searchTerm,
  setSearchTerm,
  placeholder = "Search...",
  className,
  containerClassName,
  inputRef,
  debounceTime = 500,
}: {
  containerClassName?: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  debounceTime?: number;
}) => {
  const [localValue, setLocalValue] = useState(searchTerm);

  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== searchTerm) {
        setSearchTerm(localValue);
      }
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, debounceTime, setSearchTerm, searchTerm]);

  return (
    <div className={cn("relative max-w-full flex-1 md:max-w-sm", containerClassName)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={cn("h-auto pl-8", className)}
      />
    </div>
  );
};

export default InputSearch;
