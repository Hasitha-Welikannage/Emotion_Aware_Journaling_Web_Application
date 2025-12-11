function Footer() {
  return (
    <footer className="bg-orange-50/50 border-t border-orange-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col justify-center items-center gap-4">
          
          {/* Brand & Copyright */}
          <div className="text-center">
            <p className="text-sm font-semibold text-orange-900">
              Emotion <span className="text-orange-600">Aware</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              © 2025 Journal App. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;