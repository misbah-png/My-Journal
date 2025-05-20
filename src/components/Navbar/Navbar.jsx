import styles from './Navbar.module.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.title}>My Journal</h1>
      <ThemeToggle />
    </nav>
  );
}

export default Navbar;