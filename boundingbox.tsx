interface BoundingBoxProps {
  isDetecting: boolean;
  hasMask: boolean;
}

export default function BoundingBox({
  isDetecting,
  hasMask,
}: BoundingBoxProps) {
  if (!isDetecting) return null;

  const boxColor = hasMask ? "border-green-400" : "border-red-500";
  const labelBg = hasMask ? "bg-green-400" : "bg-red-500";
  const label = hasMask ? "MASK DETECTED" : "NO MASK";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`relative w-[70%] h-[70%] border-4 ${boxColor} rounded-lg transition-all duration-300`}
      >
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-current"></div>
        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-current"></div>
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-current"></div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-current"></div>

        <div
          className={`absolute -top-8 left-1/2 transform -translate-x-1/2 ${labelBg} text-white px-4 py-1 rounded text-xs font-bold digital-font`}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
