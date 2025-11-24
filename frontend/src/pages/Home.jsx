function Home() {
    // We don't need the pt-16 padding added in the previous example 
    // since we don't have a fixed top header in this setup.
    return (
        <section className="bg-white min-h-screen flex items-start justify-center py-8">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8"> 
            <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
            <p>Welcome to the main content area. This content shifts right on desktop but remains full width on mobile.</p>
            {/* Your home page content goes here */}
        </div>
        </section>
    );
}

export default Home;