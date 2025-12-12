import Button from "../components/Button.jsx";

function Header({
  title,
  discription,
  onClick,
  callToActionText,
  callToActionIcon,
  callToActionVisible = true,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 md:p-6 mb-6">
      <div className="flex flex-col justify-between items-stretch gap-4 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{discription}</p>
        </div>
        {callToActionVisible && (
          <div className="flex flex-col items-stretch md:flex-row md:items-center mt-1 md:mt-0">
            <Button
              onClick={onClick}
              className=" transform hover:scale-[1.02] active:scale-100"
            >
              {callToActionIcon}
              {callToActionText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
