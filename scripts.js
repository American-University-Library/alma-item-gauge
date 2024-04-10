(function () {
  // The API key needs to have Bib read privileges. Note that if this will be available on the web in production a proxy is a better idea.
  const techAvail_apiKey = "ALMA_BIB_READ_API_KEY";
  const almaUrl = "https://api-na.hosted.exlibrisgroup.com"; // Use whatever endpoint is correct for your region

  /*Gauge constructor start*/
  class TechAvail_Item {
    constructor(title, mmsID) {
      this.title = title;
      this.mmsID = mmsID;
    }
    getTitle() {
      return this.title;
    }
    getID() {
      return this.mmsID;
    }
    calculators() {
      var calculators = [graphing_calculator];
      return calculators;
    }
    microphones() {
      var microphones = [yeti_mic];
      return microphones;
    }
  }
  /*Gauge constructor end*/

  // Pass whatever name you'd like the item called on the gauge and the MMSID
  const graphing_calculator = new TechAvail_Item(
    "Graphing Calculators",
    "99186263663004102"
  );
  const adjunct_laptop = new TechAvail_Item(
    "Adjunct Faculty Laptops",
    "99176077733604102"
  );
  const student_chromebook = new TechAvail_Item(
    "Chromebooks",
    "99176518653604102"
  );
  const usb_webcam = new TechAvail_Item("USB Webcam", "99179299393604102");
  const hdmi_adapters = new TechAvail_Item(
    "USB-C to HDMI adapter",
    "99186258161104102"
  );
  const yeti_mic = new TechAvail_Item(
    "Blue Yeti Microphones",
    "99179299263604102"
  );

  // This uses the DevExpress chart library along with jQuery to draw the gauges https://js.devexpress.com/Overview/Charts/

  const techAvail_gauge = (
    title,
    numAvailable,
    total,
    lowBreak,
    midBreak,
    anchor
  ) => {
    $(() => {
      $(anchor).dxCircularGauge({
        size: { width: 200 },
        margin: { left: 2, right: 2 },
        scale: {
          startValue: 0,
          endValue: total,
          tickInterval: total >= 5 ? Math.floor(total / 5) : 1,
          tick: { color: "white" },
          label: { useRangeColors: !0 },
        },
        rangeContainer: {
          palette: techAvail_gaugePalette,
          ranges: [
            { startValue: 0, endValue: lowBreak },
            { startValue: lowBreak, endValue: midBreak },
            { startValue: midBreak, endValue: total },
          ],
        },
        title: {
          text: title,
          subtitle: numAvailable.toString() + " left",
          font: { size: 18, family: "sans-serif" },
        },
        value: numAvailable,
        valueIndicator: {
          type: "rectangleNeedle",
          color: "black",
          spindleGapSize: 0,
          spindleSize: 15,
          width: 4,
        },
        geometry: { startAngle: 180, endAngle: 0 },
        animation: { easing: "linear", duration: 500 },
        redrawOnResize: !0,
      });
    });
  };

  const techAvailRequest = async (mmsId, anchor) => {
    try {
      // be sure to include the p_avail expand parameter to get the item availability information
      const url = `${almaUrl}/almaws/v1/bibs/${mmsId}?apikey=${techAvail_apiKey}&format=json&expand=p_avail`;
      const data = await fetch(url);
      const item = await data.json();
      const stringXml = item.anies[0];
      const subfields = new DOMParser()
        .parseFromString(stringXml, "application/xml")
        .getElementsByTagName("subfield");
      let total, numOnLoan;
      for (let subfield of subfields) {
        switch (subfield.getAttribute("code")) {
          case "f":
            total = parseInt(subfield.innerHTML);
            break;
          case "g":
            numOnLoan = parseInt(subfield.innerHTML);
        }
      }
      const numAvailable = Math.round(total - numOnLoan);
      const lowBreak = Math.round(0.2 * total);
      const midBreak = Math.round(0.4 * total);
      techAvail_gauge(
        item.title,
        numAvailable,
        total,
        lowBreak,
        midBreak,
        anchor
      );
    } catch (err) {
      console.log(err);
    }
  };

  const techAvail_gaugePalette = ["red", "orange", "green"];

  techAvailRequest(student_chromebook.getID(), "#gauge1");
  techAvailRequest(hdmi_adapters.getID(), "#gauge2");
  techAvailRequest(adjunct_laptop.getID(), "#gauge3");
  techAvailRequest(graphing_calculator.getID(), "#gauge4");
  techAvailRequest(yeti_mic.getID(), "#gauge5");
  techAvailRequest(usb_webcam.getID(), "#gauge6");
})();
