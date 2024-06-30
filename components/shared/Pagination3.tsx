"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface Props {
  pageNumber: number;
  isNext: boolean;
  path: string;
  pageMax?: number;  // Rendu optionnel
}

function Pagination({ pageNumber, isNext, path, pageMax }: Props) {
  const router = useRouter();

  const handleNavigation = (page: number) => {
    router.push(`/${path}?page=${page}`);
  };

  const renderPageIndicator = () => {
    const pages = [];
    
    // Previous button
    pages.push(
      <Button
        key="prev"
        onClick={() => handleNavigation(Math.max(1, pageNumber - 1))}
        disabled={pageNumber === 1}
        className='text-white bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 px-4 py-2 rounded-md'
      >
        Prev
      </Button>
    );

    // Pages before current page
    if (pageNumber > 1) {
      pages.push(
        <Button key="prevPage" onClick={() => handleNavigation(pageNumber - 1)} className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md">
          {pageNumber - 1}
        </Button>
      );
    }

    // Current page
    pages.push(
      <span key="currentPage" className="bg-blue-500 text-white px-4 py-2 rounded-md">
        {pageNumber}
      </span>
    );

    // Next page if applicable
    if (isNext) {
      pages.push(
        <Button key="nextPage" onClick={() => handleNavigation(pageNumber + 1)} className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md">
          {pageNumber + 1}
        </Button>
      );
    }

    // Last page if pageMax is provided
    if (pageMax && pageNumber < pageMax-1) {
      pages.push(
        <span key="dots" className="text-gray-700 py-2">...</span>,
        <Button key="lastPage" onClick={() => handleNavigation(pageMax)} className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md">
          {pageMax}
        </Button>
      );
    }

    // Next button
    pages.push(
      <Button
        key="next"
        onClick={() => handleNavigation(pageNumber + 1)}
        disabled={!isNext}
        className='text-white bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 px-4 py-2 rounded-md'
      >
        Next
      </Button>
    );

    return pages;
  };

  return (
    <div className="flex justify-center space-x-4 my-20">
      {renderPageIndicator()}

    </div>
  );
}

export default Pagination;
