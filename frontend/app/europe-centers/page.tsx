"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import europeCentersContent from "@/content/europe-centers.json";
import { useLanguage } from "@/hooks/useLanguage";

export default function EuropeCentersPage() {
  const { language, isRTL } = useLanguage();
  const content = europeCentersContent[language];

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <div className="bg-primary-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {content.mainTitle}
            </h1>
            <p className="text-xl max-w-3xl mx-auto">{content.intro}</p>
          </div>
        </div>

        {/* Locations Table */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary-dark text-white">
                  <tr>
                    <th className="px-6 py-4 text-right font-bold text-lg">
                      {content.tableHeaders.country}
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-lg">
                      {content.tableHeaders.city}
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-lg">
                      {content.tableHeaders.address}
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-lg">
                      {content.tableHeaders.service}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {content.locations.map((location, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {location.countryCode === "NL" && (
                            <svg
                              className="w-8 h-8 flex-shrink-0"
                              viewBox="0 0 900 600"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect width="900" height="600" fill="#21468B" />
                              <rect width="900" height="400" fill="#FFF" />
                              <rect width="900" height="200" fill="#AE1C28" />
                            </svg>
                          )}
                          <span className="font-semibold text-primary-dark text-lg">
                            {location.country}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {location.city}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="whitespace-pre-line">{location.address}</div>
                        {location.description && (
                          <div className="mt-2 text-sm text-gray-600 italic">
                            {location.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {location.services.map((service, idx) => (
                            <span
                              key={idx}
                              className="bg-primary-yellow text-primary-dark px-3 py-1 rounded-full text-sm font-bold"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {content.locations.map((location, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-primary-yellow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {location.countryCode === "NL" && (
                      <svg
                        className="w-12 h-12 flex-shrink-0"
                        viewBox="0 0 900 600"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="900" height="600" fill="#21468B" />
                        <rect width="900" height="400" fill="#FFF" />
                        <rect width="900" height="200" fill="#AE1C28" />
                      </svg>
                    )}
                    <div>
                      <div className="font-bold text-primary-dark text-lg">
                        {location.country}
                      </div>
                      <div className="text-gray-600">{location.city}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {content.tableHeaders.address}
                    </div>
                    <div className="text-gray-700 whitespace-pre-line">{location.address}</div>
                    {location.description && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        {location.description}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-2">
                      {content.tableHeaders.service}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {location.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="bg-primary-yellow text-primary-dark px-3 py-1 rounded-full text-sm font-bold"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Info */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-dark text-center mb-12">
              {content.servicesInfo.title}
            </h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* LCL Card */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-yellow">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-12 h-12 text-primary-yellow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold text-primary-dark">
                    {content.servicesInfo.lcl.title}
                  </h3>
                </div>
                <p className="text-gray-700">
                  {content.servicesInfo.lcl.description}
                </p>
              </div>

              {/* FCL Card */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-dark">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-12 h-12 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold text-primary-dark">
                    {content.servicesInfo.fcl.title}
                  </h3>
                </div>
                <p className="text-gray-700">
                  {content.servicesInfo.fcl.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
