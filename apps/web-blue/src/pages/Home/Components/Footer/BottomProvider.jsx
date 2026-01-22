const BottomProvider = () => {
  return (
    <div>
      {/*--provider---*/}
      <div className="p-1">
        <div
          className="row justify-content-center"
          style={{ marginBottom: "100px" }}
        >
          
          <div className="col-lg-4  col-md-6 px-1">
            <div className="game_provider_item">
              <img src="assets/img/footer_icon/spribe.svg" alt="spribe" />
            </div>
          </div>
          <div className="col-lg-4  col-md-6 px-1">
            <div className="game_provider_item">
              <img src="assets/img/footer_icon/evolution.svg" alt="spribe" />
            </div>
          </div>
          {/* <div className="col-4 px-1">
            <div className="game_provider_item">
              <img
                src="assets/img/footer_icon/4rabet_exclusive.svg"
                alt="4rabet_exclusive"
              />
            </div>
          </div> */}
          <div className="col-lg-4 col-md-6 px-1">
            <div className="game_provider_item">
              <img src="assets/img/footer_icon/smartsoft.svg" alt="SmartSoft" />
            </div>
          </div>
          <div className="col-lg-3 col-md-6 px-1">
            <div className="game_provider_item">
              <img src="assets/img/footer_icon/aviatrix.svg" alt="aviatrix" />
            </div>
          </div>
          <div className="col-lg-3 col-md-6 px-1">
            <div className="game_provider_item">
              <img src="assets/img/footer_icon/threeoaks.svg" alt="threeOaks" />
            </div>
          </div>
          <div className="col-lg-3 col-md-6 px-1">
            <div className="game_provider_item">
              <img src="assets/img/footer_icon/ezugi.svg" alt="ezugi" />
            </div>
          </div>
          <div className="col-lg-3 col-md-6 px-1">
            <div className="game_provider_item">
              <img
                src="assets/img/footer_icon/betgames.svg"
                alt="betGames"
                className="object-contain"
              />
             
            </div>
          </div>

          {/* <div className="col-4 px-1">
            <div className="game_provider_item">
              <img src="assets/img/footer_icon/pgsoft.svg" alt="pgSoft" />
            </div>
          </div> */}
        </div>
      </div>
      {/*--provider-end*/}
    </div>
  );
};

export default BottomProvider;
