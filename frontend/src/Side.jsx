/**
 * Side Component - Sidebar area for left/right layout sections
 * Renders positioned sidebar content based on the position prop
 * 
 * @param {string} position - Either "left" or "right" to determine sidebar placement
 */
export default function Side({ position }) {
	return (
		<aside className={`side-area side-area-${position}`}>
			{/* Display content based on sidebar position */}
			<p>{position === 'left' ? 'Left Side' : 'Right Side'}</p>
		</aside>
	);
}
