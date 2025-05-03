export default function Stats() {
  return (
    <section className="bg-white py-12 border-t border-b border-neutral-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary mb-2">30%</p>
            <p className="text-neutral-700">Average Cost Reduction</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary mb-2">92%</p>
            <p className="text-neutral-700">Employee Satisfaction</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent mb-2">45K+</p>
            <p className="text-neutral-700">Trips Managed Monthly</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-700 mb-2">24/7</p>
            <p className="text-neutral-700">Global Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
