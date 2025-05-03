
import React from "react";
import Hero from "@/components/LandingPage/Hero";

const Index = () => {
  return (
    <div className="min-h-screen">
      <header className="p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-planwise-purple">
              Plan<span className="text-gray-800">wise</span>
            </span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto">
        <Hero />
      </main>
      
      <footer className="py-6 border-t mt-10">
        <div className="container mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Planwise - Agile estimation made simple
        </div>
      </footer>
    </div>
  );
};

export default Index;
