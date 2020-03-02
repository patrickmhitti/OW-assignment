var formatDate = function (value){
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY hh:mm:ss')
  }
};

var activities = Vue.extend({
    data () {
        return {
          lines: null,
          stopPoints: null,
          shortSchedule: null,
          longScheduleInbound: null,
          longScheduleOutbound: null,
          key: '',
          selectedStation: null,
          timer: null,
          lastUpdateDate: null,
          selectedLine: null
        }
      },
    template: '#activities-template',
  
    methods: {
        
        compare(a, b) {
            if (a.expectedArrival - b.expectedArrival) return 1;
            if (b.expectedArrival > a.expectedArrival) return -1;
          
            return 0;
          },
        onSelectLine(event){
          axios
          .get('https://api.tfl.gov.uk/Line/' + event.target.value + '/StopPoints')
          .then(response => {(this.stopPoints = response.data);});
          document.getElementById("cmbStations").focus();
        },
        onSelectStation(event){
            if (event == undefined)
            {
                event = selectedStation;
            }
            else
            {
                selectedStation = event;
            }
            clearTimeout(this.timer); 
            this.timer = setInterval(this.onSelectStation, 6000)
            this.selectedLine = document.getElementById("cmbLines").value;
            axios
            .get('https://api.tfl.gov.uk/Line/' + this.selectedLine + '/Arrivals/' + event.target.value)// + '?direction=inbound')
            .then(response => {
                this.shortSchedule = response.data.sort(this.compare);  

                this.longScheduleInbound = response.data.sort(this.compare);
                this.longScheduleInbound = this.longScheduleInbound.slice().filter(a => a.direction == 'inbound');

                this.longScheduleOutbound = response.data.sort(this.compare);
                this.longScheduleOutbound = this.longScheduleOutbound.slice().filter(a => a.direction == 'outbound');   
                this.lastUpdateDate = new Date();
                console.clear();
                console.log('Refresh completed at: ' + formatDate(this.lastUpdateDate))
            }); 
        }
      },
      mounted () { 
        axios
          .get('https://api.tfl.gov.uk/Line/Mode/tube')
          .then(response => this.lines = response.data);
      }
});
Vue.component('activities-component', activities);

new Vue({
    el: '#app'
});

var disruptions = Vue.extend({
  data () {
      return {
        linesDisruptions: null
      }
    },
  template: "#disruptions-template",
 
  mounted () { 
      axios
        .get('https://api.tfl.gov.uk/Line/Mode/tube%2C%20bus/Disruption') //https://api.tfl.gov.uk/Line/Mode/tube%2C%20bus/Disruption
        .then(response => {this.linesDisruptions = response.data; console.log(this.linesDisruptions);})
    }
});

Vue.component('disruptions-component', disruptions);

new Vue({
    el: '#dis'    
});