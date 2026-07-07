import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SCORECARD } from "@/lib/constants";

export const metadata = {
  title: "Scorecard",
};

type ScorecardHole = {
  hole: number;
  par: number;
  handicap: number;
  blue: number;
  white: number;
  gold: number;
  red: number;
};

function ScorecardSection({
  title,
  holes,
  totals,
}: {
  title: string;
  holes: readonly ScorecardHole[];
  totals: { par: number; blue: number; white: number; gold: number; red: number };
}) {
  return (
    <div>
      <h2 className="mb-4 font-heading text-2xl font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hole</TableHead>
              <TableHead>Par</TableHead>
              <TableHead>HCP</TableHead>
              <TableHead>Blue</TableHead>
              <TableHead>White</TableHead>
              <TableHead>Gold</TableHead>
              <TableHead>Red</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holes.map((hole) => (
              <TableRow key={hole.hole}>
                <TableCell className="font-medium">{hole.hole}</TableCell>
                <TableCell>{hole.par}</TableCell>
                <TableCell>{hole.handicap}</TableCell>
                <TableCell>{hole.blue}</TableCell>
                <TableCell>{hole.white}</TableCell>
                <TableCell>{hole.gold}</TableCell>
                <TableCell>{hole.red}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell>Total</TableCell>
              <TableCell>{totals.par}</TableCell>
              <TableCell>—</TableCell>
              <TableCell>{totals.blue}</TableCell>
              <TableCell>{totals.white}</TableCell>
              <TableCell>{totals.gold}</TableCell>
              <TableCell>{totals.red}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function ScorecardPage() {
  const frontTotals = {
    par: SCORECARD.totals.frontPar,
    blue: SCORECARD.front.reduce((s, h) => s + h.blue, 0),
    white: SCORECARD.front.reduce((s, h) => s + h.white, 0),
    gold: SCORECARD.front.reduce((s, h) => s + h.gold, 0),
    red: SCORECARD.front.reduce((s, h) => s + h.red, 0),
  };
  const backTotals = {
    par: SCORECARD.totals.backPar,
    blue: SCORECARD.back.reduce((s, h) => s + h.blue, 0),
    white: SCORECARD.back.reduce((s, h) => s + h.white, 0),
    gold: SCORECARD.back.reduce((s, h) => s + h.gold, 0),
    red: SCORECARD.back.reduce((s, h) => s + h.red, 0),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-semibold">Scorecard</h1>
        <p className="mt-2 text-muted-foreground">
          Par {SCORECARD.totals.totalPar} · Blue tees {SCORECARD.totals.blue} yards
        </p>
      </div>
      <div className="space-y-10">
        <ScorecardSection title="Front Nine" holes={SCORECARD.front} totals={frontTotals} />
        <ScorecardSection title="Back Nine" holes={SCORECARD.back} totals={backTotals} />
      </div>
    </div>
  );
}
