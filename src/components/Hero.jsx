export default function Hero() {
  return (
    <div class="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left">
          <h1 className="text-5xl font-bold">draw.puntogris</h1>
          <p className="py-6">
            Personal site for drawing using <a href="https://github.com/excalidraw/excalidraw">Exalidraw</a>.
          </p>
        </div>
        <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
          <div className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="text"
                placeholder="email"
                className="input-bordered input"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="text"
                placeholder="password"
                className="input-bordered input"
              />
              <label className="label">
                <a href="#" className="link-hover label-text-alt link">
                  Want an account?
                </a>
              </label>
            </div>
            <div className="form-control mt-6">
              <button className="btn-primary btn">Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
