"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import Header from "@/components/header";

export default function RateLimitingPage() {
  const [rateLimit, setRateLimit] = useState(100);
  const [appliedLimit, setAppliedLimit] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [message, setMessage] = useState(null); // To show success/error messages

  const handleApplyRateLimit = async () => {
    try {
      const response = await fetch("http://localhost:8000/apply_rate_limit", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ user_value: rateLimit.toString() }),
      });

      const data = await response.json();

      if (response.ok) {
        setAppliedLimit(rateLimit);
        setIsApplied(true);
        setMessage({ type: "success", text: "Rate limiting applied successfully!" });
      } else {
        throw new Error(data.error || "Failed to apply rate limiting.");
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const handleRevertRateLimit = async () => {
    try {
      const response = await fetch("http://localhost:8000/revert_rate_limit", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        setIsApplied(false);
        setAppliedLimit(null);
        setMessage({ type: "success", text: "Rate limiting reverted successfully!" });
      } else {
        throw new Error(data.error || "Failed to revert rate limiting.");
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header/>

      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar />
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Rate Limiting</h1>
          </div>

          <Tabs defaultValue="configure" className="w-full">
            <TabsList>
              <TabsTrigger value="configure">Configure</TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rate Limit Configuration</CardTitle>
                  <CardDescription>Set and manage rate limits for your Kubernetes API server</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="rate-limit">Rate Limit (requests per second)</Label>
                      <span className="text-sm text-muted-foreground">{rateLimit} req/s</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input
                        id="rate-limit"
                        type="number"
                        min="10"
                        max="1000"
                        value={rateLimit}
                        onChange={(e) => setRateLimit(Number.parseInt(e.target.value))}
                        className="w-24"
                      />
                      <div className="flex-1">
                        <Slider
                          value={[rateLimit]}
                          min={10}
                          max={1000}
                          step={10}
                          onValueChange={(value) => setRateLimit(value[0])}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <Button variant="default" onClick={handleApplyRateLimit} className="sm:w-auto w-full">
                      Apply Rate Limiting
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRevertRateLimit}
                      className="sm:w-auto w-full"
                      disabled={!isApplied}
                    >
                      Revert Rate Limiting
                    </Button>
                  </div>

                  {/* Success/Error Message */}
                  {message && (
                    <div className={`mt-4 text-sm font-medium ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
                      {message.text}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                  <CardDescription>Current rate limiting configuration and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="font-medium">
                          {isApplied ? (
                            <span className="text-green-500">Active</span>
                          ) : (
                            <span className="text-amber-500">Not Active</span>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Current Limit</p>
                        <p className="font-medium">{appliedLimit ? `${appliedLimit} req/s` : "No limit applied"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Applied At</p>
                        <p className="font-medium">{isApplied ? new Date().toLocaleString() : "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Applied By</p>
                        <p className="font-medium">{isApplied ? "admin@example.com" : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
