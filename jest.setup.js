// jest.setup.js
import '@testing-library/jest-dom'

// You can add other global setups here if needed.
// For example, polyfills or common mocks.

// Example: Mocking Next.js Image component if not handled by next/jest automatically
// jest.mock('next/image', () => ({
//   __esModule: true,
//   default: (props) => {
//     // eslint-disable-next-line @next/next/no-img-element
//     return <img {...props} alt={props.alt || ""} />;
//   },
// }));

// Example: Mocking a global function or API
// global.matchMedia = global.matchMedia || function() {
//   return {
//     matches : false,
//     addListener : function() {},
//     removeListener: function() {}
//   }
// }
