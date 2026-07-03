/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import MPCPlayer from './components/MPCPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans flex flex-col overflow-x-hidden md:py-8">
      <MPCPlayer />
    </div>
  );
}
