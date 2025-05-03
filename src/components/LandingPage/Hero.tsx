
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import CreateMeeting from "./CreateMeeting";

const Hero: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-planwise-purple">
          <span className="relative">
            Plan
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-planwise-blue"></span>
          </span>
          <span className="text-gray-800">wise</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
          Collaborative agile estimation made simple.
          Bring your team together for more effective planning.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-planwise-purple/20">
          <CardHeader>
            <CardTitle>Start a Planning Session</CardTitle>
            <CardDescription>
              Create a new planning poker session and invite your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateMeeting />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-4xl"
      >
        <Card className="border border-planwise-light-purple">
          <CardHeader>
            <CardTitle className="text-lg">Easy Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Share a link with your team to start estimating issues together in real-time.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-planwise-light-purple">
          <CardHeader>
            <CardTitle className="text-lg">Import Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Upload Excel, CSV or PDF files to quickly import your backlog items.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-planwise-light-purple">
          <CardHeader>
            <CardTitle className="text-lg">Visualize Consensus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              See real-time voting patterns and quickly reach consensus on estimates.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Hero;
