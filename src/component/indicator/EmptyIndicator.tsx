import { A } from "@solidjs/router";

export default function EmptyIndicator() {
  return (
    <>
      <p>No data.</p>
      <A href="/">Return to main page</A>
    </>
  );
}
