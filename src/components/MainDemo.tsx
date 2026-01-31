import React from "react";
import { type Category, CATEGORIES } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type MainDemoProps = {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
};

const MainDemo: React.FC<MainDemoProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <>
      <img
        src={CATEGORIES[selectedCategory].img}
        alt=""
        className="h-full w-full object-cover"
      />

      <Select
        onValueChange={(value) => onCategoryChange(value as Category)}
        defaultValue={selectedCategory}
        value={selectedCategory}
      >
        <SelectTrigger className="bg-popover/95 absolute top-4 right-4 z-30 shadow-lg">
          <SelectValue placeholder="カテゴリ" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <SelectItem key={k} value={k}>
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default MainDemo;
