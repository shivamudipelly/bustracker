import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "@/components/ui/sonner";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: Route not found -", location.pathname);
    toast.error("Page not found");
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 to-slate-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-300 rounded-full blur-2xl opacity-30 animate-float" />

      <Card className="z-10 w-full max-w-xl shadow-xl border-none bg-white/90 backdrop-blur-md animate-fade-in-up">
        <CardContent className="p-10 text-center">
          {/* Error Graphic */}
          <div className="relative inline-block mb-6">
            <div className="text-[88px] font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700 animate-scale-in">
              404
            </div>
            <AlertTriangle className="absolute top-12 -right-12 text-yellow-400 h-12 w-12 animate-wiggle" />
          </div>

          {/* Message */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">This page wandered off the map</h1>
          <p className="text-sm text-gray-600 mb-2">
            We couldn't find the page at{" "}
            <code className="px-2 py-1 rounded bg-gray-100 text-red-600">{location.pathname}</code>
          </p>
          <p className="text-xs text-gray-500">Maybe try one of the buttons below?</p>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-2 border-gray-300 hover:border-blue-500 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link to="/">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-transform hover:scale-105">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>

          {/* Floating Dots */}
          <div className="mt-8 flex justify-center gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Floating Road Effect */}
      <div className="absolute bottom-10 w-full text-center">
        <div className="inline-block px-6 py-2 bg-black/80 text-white text-xs uppercase tracking-widest rounded-full shadow-lg animate-fade-in animate-delay-1000">
          You're off-road 🛣️ — let's get you back on track!
        </div>
      </div>
    </div>
  );
};

export default NotFound;
