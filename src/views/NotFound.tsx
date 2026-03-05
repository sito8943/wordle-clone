import { Link } from "react-router";

const NotFound = () => {
  return (
    <main className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-bold">404 - Not Found</h2>
      <p className="mt-2 text-base text-neutral-600">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="text-blue-500 hover:text-blue-700">
        Go back home
      </Link>
    </main>
  );
};

export default NotFound;
