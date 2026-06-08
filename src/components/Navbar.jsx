import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated, userRole, logout, cartCount }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = userRole === "admin";

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  const close = () => setOpen(false);

  return (
    <header className="gt-nav">
      <div className="gt-nav__inner">
        {/* Brand */}
        <Link to="/plants" className="gt-nav__brand" onClick={close}>
          <span className="gt-nav__logo">GN</span>
          <span className="gt-nav__title">Green Nursery</span>
        </Link>

        {/* Desktop links */}
        <nav className="gt-nav__links">
          {isAuthenticated && (
            <>
              <NavLink
                to="/plants"
                className={({ isActive }) =>
                  `gt-nav__link ${isActive ? "is-active" : ""}`
                }
              >
                Plants
              </NavLink>

              {/* Profile only for users (not admin) */}
              {!isAdmin && (
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `gt-nav__link ${isActive ? "is-active" : ""}`
                  }
                >
                  Profile
                </NavLink>
              )}

              {isAdmin && (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `gt-nav__link ${isActive ? "is-active" : ""}`
                    }
                  >
                    Admin
                  </NavLink>

                  <NavLink
                    to="/manage-plants"
                    className={({ isActive }) =>
                      `gt-nav__link ${isActive ? "is-active" : ""}`
                    }
                  >
                    Manage Plants
                  </NavLink>

                  <NavLink
                    to="/manage-users"
                    className={({ isActive }) =>
                      `gt-nav__link ${isActive ? "is-active" : ""}`
                    }
                  >
                    Manage Users
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>

        {/* Right actions */}
        <div className="gt-nav__actions">
          {isAuthenticated ? (
            <>
              {/* Cart icon only for users (not admin) */}
              {!isAdmin && (
                <Link
                  to="/cart"
                  className="gt-nav__cart"
                  onClick={close}
                  aria-label="Cart"
                >
                  <span className="gt-nav__cartIcon">🛒</span>
                  {cartCount > 0 && (
                    <span className="gt-nav__badge">{cartCount}</span>
                  )}
                </Link>
              )}

              <span className="gt-nav__role">{isAdmin ? "Admin" : "Customer"}</span>

              <button className="gt-nav__btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="gt-nav__btn gt-nav__btn--ghost">
                Login
              </Link>
              <Link to="/register" className="gt-nav__btn">
                Register
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            className="gt-nav__burger"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="gt-nav__mobile">
          {isAuthenticated ? (
            <>
              <NavLink to="/plants" className="gt-nav__mobileLink" onClick={close}>
                Plants
              </NavLink>

              {/* Profile only for users */}
              {!isAdmin && (
                <NavLink
                  to="/profile"
                  className="gt-nav__mobileLink"
                  onClick={close}
                >
                  Profile
                </NavLink>
              )}

              {/* Cart only for users */}
              {!isAdmin && (
                <NavLink to="/cart" className="gt-nav__mobileLink" onClick={close}>
                  Cart {cartCount > 0 ? `(${cartCount})` : ""}
                </NavLink>
              )}

              {isAdmin && (
                <>
                  <NavLink to="/admin" className="gt-nav__mobileLink" onClick={close}>
                    Admin
                  </NavLink>
                  <NavLink
                    to="/manage-plants"
                    className="gt-nav__mobileLink"
                    onClick={close}
                  >
                    Manage Plants
                  </NavLink>
                  <NavLink
                    to="/manage-users"
                    className="gt-nav__mobileLink"
                    onClick={close}
                  >
                    Manage Users
                  </NavLink>
                </>
              )}

              <button className="gt-nav__mobileBtn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="gt-nav__mobileLink" onClick={close}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="gt-nav__mobileLink"
                onClick={close}
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;