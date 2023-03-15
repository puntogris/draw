import { useNavigate, useOutletContext } from "@remix-run/react";
import { useState } from "react";

export default function Index() {
  const { supabase } = useOutletContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setState("LOADING");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (!error) {
      navigate("/dashboard");
    } else {
      setState("ERROR");
    }
  };

  return (
    <div>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">draw.puntogris</h1>
            <p className="py-6">
              Personal site for drawing using{" "}
              <a href="https://github.com/excalidraw/excalidraw">Exalidraw</a>.
            </p>
          </div>

          <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
            <div className="card-body">
              {state == "ERROR" && <AlertError />}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="text"
                  placeholder="email"
                  className="input-bordered input"
                  onChange={(v) => setEmail(v.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="password"
                  className="input-bordered input"
                  onChange={(v) => setPassword(v.target.value)}
                />
                <label className="label">
                  <a
                    href="/dashboard"
                    className="link-hover label-text-alt link"
                  >
                    Want an account?
                  </a>
                </label>
              </div>
              <div className="form-control mt-6">
                {state == "LOADING" ? (
                  <button
                    className="btn-primary btn loading"
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                ) : (
                  <button className="btn-primary btn" onClick={handleLogin}>
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertError() {
  return (
    <div className="alert alert-error shadow-lg h-10">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Invalid credentials.</span>
      </div>
    </div>
  );
}
