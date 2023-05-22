import LoadingSpinner from "./LoadingSpinner";

export default function Loading() {
  return (
    <div class="w-fit mx-auto flex items-center gap-x-2">
      <LoadingSpinner />
      <span>Processing...</span>
    </div>
  );
}
