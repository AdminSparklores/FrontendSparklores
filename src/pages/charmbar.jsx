import NavBar_Charmbar from '../components/Charmbar/navbar_charmbar.jsx'
import CharmCustomizerFull from '../components/Charmbar/charmbar_pt1.jsx'

import Footer from '../components/footer.jsx'


export default function Charmbar() {
    return (
      <>
          <NavBar_Charmbar/>
          {/* <Charmbar_display1/> */}
          <CharmCustomizerFull/>
          <Footer />
      </>
    )
  }