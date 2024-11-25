import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card, CardTitle } from "@/components/ui/card";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function SpecificMeasurements({ productNo }) {

  return (
    <Card className="p-5 mb-20">
      <CardTitle className="text-2xl">Specific Measurements</CardTitle>
    </Card>
  );
}
