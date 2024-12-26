import React, { useEffect, useState } from "react";
import { getAuditeeTeamDtoList, getAuditorIsActiveList, getAuditTeamMemberList, getIqaDtoList, getTeamMemberIsActiveList, insertAuditTeam } from "../../services/audit.service";
import Navbar from "../Navbar/Navbar";
import SelectPicker from '../selectpicker/selectPicker';
import Datatable from "../datatable/Datatable";
import { getScheduleList,getTeamList,getIqaAuditeelist,getTotalTeamMembersList } from "../../services/audit.service";
import internalAuditorTeamsPrint from "components/prints/qms/internalAduitor-teams-print";
import AuditSchedulePrint from "components/prints/qms/auditSchedule-print";
import mergePdf from"components/prints/qms/auditorsSchedulemergePdf";
import dayjs from 'dayjs';
import { format } from "date-fns";
const AuditSummaryReport = () => {
  const [auditTeamDtoList, setAuditTeamDtoList] = useState([]);
  const [filAuditTeamDtoList, setFilAuditTeamDtoList] = useState([]);
  const [auditTeamMemberDtoList, setAuditTeamMemberDtoList] = useState([]);
   const [iqaId, setIqaId] = useState('');
  const [iqaOptions, setIqaOptions] = useState([]);
  const [iqaNo, setIqaNo] = useState('');
  const [iqaFullList, setIqaFullList] = useState([])
  const [initialValues,setInitialValues] = useState({
      scheduleId   : '',
      scheduleDate : '',
      auditeeId    : '',
      teamId       : '',
      iqaId        : '',
      revision     : '',
      remarks      : 'NA',
    });
      const [filScheduleList,setFilScheduleList] = useState([]);
      const [PrintList1,setPrintList1] = useState([]);
      
      const [scheduleList,setScheduleList] = useState([]);
      const [teamList,setTeamList] = useState([]);
      const [filTeamList,setFilTeamList] = useState([]);
      const [scdDate,setScdDate] = useState(dayjs(new Date()).hour(9).minute(30));
      const [isReady, setIsReady] = useState(false);
      const [iqaFromDate,setIqaFromDate] = useState(dayjs(new Date()));
       const [iqaToDate,setIqaToDate] = useState(dayjs(new Date()));
       const [fullAuditeeList,setFullAuditeeList] = useState([]);
       const [auditeeList,setAuditeeList] = useState([]);
       const [filauditeeList,setFilAuditeeList] = useState([]);
      const [teamMemberDetails,setTeamMemberDetails] = useState([]);
      const [totalAuditeeCount,setTotalAuditeeCount] = useState(0);
      const [pendingAuditeeCount,setPendingAuditeeCount] = useState(0);
      const [selectedOption, setSelectedOption] = useState("A");
      const [labDetails, setLabDetails] = useState([]);
      const [logoimage, setLogoimage] = useState(null);
      const [drdoLogo, setDrdoLogo] = useState(null);

      const fetchData = async () => {
         try {
           const scdList        = await getScheduleList();
           const team           = await getTeamList();
           const iqaList        = await getIqaDtoList();
           const auditList      = await getIqaAuditeelist();
           const teamMemDetails = await getTotalTeamMembersList();
          setTeamMemberDetails(teamMemDetails)
           setFullAuditeeList(auditList)
           setIqaFullList(iqaList);
           setScheduleList(scdList)
           const iqaData = iqaList.map(data => ({
                           value : data.iqaId,
                           label : data.iqaNo
                       }));
           if(iqaList.length >0){
             const iqa = iqaList[0];
             setIqaNo(iqa.iqaNo)
             setIqaId(iqa.iqaId)
             const filList = auditList.filter(data => data.iqaId === iqa.iqaId);
             setAuditeeList(filList)
             setTotalAuditeeCount(filList.length)
             setIqaFromDate(dayjs(new Date(iqa.fromDate)))
             setIqaToDate(dayjs(new Date(iqa.toDate)))
             setFilTeamList(team.filter(data => data.iqaId === iqa.iqaId));
             const scList = scdList.filter(data => data.iqaId === iqa.iqaId)
             const auditees = scList.map(data => data.auditeeId);
             setFilAuditeeList(auditList.filter(data => !auditees.includes(data.auditeeId)))
             setPendingAuditeeCount(filList.length - scList.length)
             setDataTable(scList);
           }
           setIqaOptions(iqaData)
           setTeamList(team)
     
           setInitialValues(prevValues =>({
             ...prevValues,
             scheduleDate : scdDate.$d
           }));
           setIsReady(true);
     
         } catch (error) {
           console.error("Error fetching data:", error);
         }
       };
       const teamMembersGrouped = auditTeamMemberDtoList.reduce((acc, member) => {
        if (!acc[member.teamId]) {
          acc[member.teamId] = [];
        }
        // Push an object containing both teamMembers and isLead
        acc[member.teamId].push({
          name: member.teamMembers, // Assuming `teamMembers` is the member name
          isLead: member.isLead,   // Include `isLead` property
        });
        return acc;
      }, {});
      const handleRadioChange = (event) => {
        setSelectedOption(event.target.value);
     
        // Add any additional logic here
      };
      const auditTeamList = async () => {
        try {
          const [AuditTeamDtoList, IqaList] = await Promise.all([getAuditeeTeamDtoList(), getIqaDtoList()]);
    
          setIqaFullList(IqaList)
          const iqaData = IqaList.map(data => ({
            value: data.iqaId,
            label: data.iqaNo
          }));
          if (IqaList.length > 0) {
            setIqaNo(IqaList[0].iqaNo)
            setIqaId(IqaList[0].iqaId)
            setFilAuditTeamDtoList(AuditTeamDtoList.filter(data => data.iqaId === IqaList[0].iqaId));
          }
          setIqaOptions(iqaData)
          latestData();
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
    
        }
      };
    
      const latestData = async () => {
        const [AuditTeamDtoList, AuditorList, TeamMemberList, AuditTeamMemberList, IqaList] = await Promise.all([getAuditeeTeamDtoList(), getAuditorIsActiveList(), getTeamMemberIsActiveList(), getAuditTeamMemberList(), getIqaDtoList()]);
      
           setAuditTeamMemberDtoList(AuditTeamMemberList);
            setAuditTeamDtoList(AuditTeamDtoList);
          if (IqaList.length > 0) {
          setFilAuditTeamDtoList(AuditTeamDtoList.filter(data => data.iqaId === (iqaId === '' ? IqaList[0].iqaId : iqaId)));
        }
      }
       const columns = [
        { name: 'SN', selector: (row) => row.sn, sortable: true, grow: 1, align: 'text-center', width: '3%'  },
        { name: 'Date & Time (Hrs)', selector: (row) => row.date, sortable: true, grow: 2, align: 'text-center', width: '11%'  },
        { name: 'Division/Group', selector: (row) => row.divisionCode, sortable: true, grow: 2, align: 'text-left', width: '15%'  },
        { name: 'Project', selector: (row) => row.project, sortable: true, grow: 2, align: 'text-left', width: '19%'  },
        { name: 'Auditee', selector: (row) => row.auditee, sortable: true, grow: 2, align: 'text-left', width: '17%'  },
        { name: 'Team', selector: (row) => row.team, sortable: true, grow: 2, align: 'text-left', width: '7%'  },
             ];
 
            // Determine the maximum number of auditors
            const maxAuditors = Math.max(
              ...filAuditTeamDtoList.map(
                  (team) => (teamMembersGrouped[team.teamId] || []).length
              )
          );
          
          const InAuditorTeamscolumns = [
              { name: 'SN', selector: (row) => row[0], sortable: true, grow: 1, align: 'text-center', width: '3%' },
              { name: 'Teams', selector: (row) => row[1], sortable: true, grow: 2, align: 'text-left', width: '11%' },
          ];
          
          // Dynamically add columns for auditors
          for (let i = 1; i <= maxAuditors; i++) {
              InAuditorTeamscolumns.push({
                  name: `Auditor ${i}`,
                  selector: (row) => row[i + 1], // Row index starts at 2 because the first two columns are SN and Teams
                  sortable: true,
                  align: 'text-left',
                  width: '10%',
              });
          }
          
          let tableBody = [];
          // Create table rows based on team data
          filAuditTeamDtoList.forEach((team, index) => {
              const teamMembers = teamMembersGrouped[team.teamId] || [];
              const auditors = teamMembers.map((member) => member.name);
          
              // Add SN and Teams columns
              const row = [
                  index + 1, // SN
                  team.teamCode || '-', // Teams
              ];
          
              // Add auditor names to the row
              for (let i = 0; i < maxAuditors; i++) {
                  row.push(auditors[i] || '-');
              }
            tableBody.push(row); // Push the constructed row into the tableBody array
          });
          
          // Set tableBody into the component state if needed
         
           
    
       useEffect(() => {
         fetchData();
       }, [isReady]);
     

  useEffect(() => {
    auditTeamList();
  }, []);



    const onIqaChange = (value)=>{
      //for auitor teams on change
   const iqa = iqaFullList.filter(data => data.iqaId === value);
    setFilAuditTeamDtoList(auditTeamDtoList.filter(data => data.iqaId === value));
    setIqaId(value);
    setIqaNo(iqa && iqa.length > 0 && iqa[0].iqaNo)
            //for schedule on change
      const selectedIqa = iqaFullList.find(data => data.iqaId === value);
      if(selectedIqa){
        setIqaNo(selectedIqa.iqaNo)
        setIqaFromDate(dayjs(new Date(selectedIqa.fromDate)))
        setIqaToDate(dayjs(new Date(selectedIqa.toDate)))
     }
      setIqaId(value);
      setFilTeamList(teamList.filter(data => data.iqaId === value))
      const scList = scheduleList.filter(data => data.iqaId === value)
      setDataTable(scList)
      const filList = fullAuditeeList.filter(data => data.iqaId === value);
      setAuditeeList(filList)
    }
  const setDataTable = (list)=>{
    if (!list || list.length === 0) {
      setFilScheduleList([{ message: "No data available." }]);
      return;
    }

  
    const mappedData = list.map((item,index)=>{
     return{
        sn           : index+1,
        date         :  format(new Date(item.scheduleDate),'dd-MM-yyyy HH:mm') || '-',
        divisionCode : item.divisionName === '' && item.groupName === '' ? '-' : item.divisionName !== '' && item.groupName !== '' ? item.divisionName + '/' + item.groupName : item.divisionName !== '' ? item.divisionName : item.groupName !== '' ? item.groupName : '-',
        project      : item.projectName === ''?'-':item.projectName || '-',
        auditee      : item.auditeeEmpName || '-',
        team         : item.teamCode || '-',
}      
    });
setFilScheduleList(mappedData);

   }


  
  return (
    <div>
      <Navbar />
      <div className="card">
        <div className="card-body text-center">
          <div className="row">
            <div className="col-md-2">
            </div>
            <div className="col-md-4">
              <h5>{iqaNo} : Audit Summary Report</h5>
            </div>
            <div className="col-md-2">
            </div>
              <div className="col-md-2">
              <SelectPicker options={iqaOptions} label="IQA No"
                value={iqaOptions && iqaOptions.length > 0 && iqaOptions.find(option => option.value === iqaId) || null}
                handleChange={(newValue) => { onIqaChange(newValue?.value) }} />
            </div>
              <div className="col-md-2" style={{display: "flex",alignItems: "center",justifyContent: "space-between", gap: "10px", }}>
  {/* All Print */}
  <div style={{ textAlign: "center" }}>
  <button
    onClick={() =>
      mergePdf(filScheduleList, iqaNo, iqaFromDate, iqaToDate, filAuditTeamDtoList, teamMembersGrouped)
    }
    title="All Print"
    aria-label="Print All AuditSchedule"
    style={{ margin: "0 5px" }}
  >
    <i className="material-icons">print</i> &nbsp;Print All
  </button>
</div>

  {/* Auditor Teams */}
  
</div>
          
          </div><br />
          <div className="row">    
  <div style={{ padding: '10px' }}>
  <input type="radio" id="auditorTeams" name="auditOption" value="A"  checked={selectedOption === "A"} onChange={handleRadioChange} /> <label htmlFor="auditorTeams" style={{ fontWeight: 'bold' }}>Auditors </label>&nbsp;&nbsp;
  <input type="radio" id="scheduleList" name="auditOption" value="S"  checked={selectedOption === "S"} onChange={handleRadioChange} /> <label htmlFor="scheduleList" style={{ fontWeight: 'bold' }}>Schedule List</label>&nbsp;&nbsp;
  {/* <input type="radio" id="nc" name="auditOption" value="N"  checked={selectedOption === "N"} onChange={handleRadioChange} /> <label htmlFor="nc" style={{ fontWeight: 'bold' }}>NC</label>&nbsp;&nbsp;
  <input type="radio" id="obc" name="auditOption" value="B"  checked={selectedOption === "B"} onChange={handleRadioChange} /> <label htmlFor="obc" style={{ fontWeight: 'bold' }}>OBS</label>&nbsp;&nbsp;
  <input type="radio" id="ofi" name="auditOption" value="O"  checked={selectedOption === "O"} onChange={handleRadioChange} /> <label htmlFor="ofi" style={{ fontWeight: 'bold' }}>OFI</label>
  */}
 &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
  {selectedOption === 'A' && (
    <button
      onClick={() => internalAuditorTeamsPrint(filAuditTeamDtoList, teamMembersGrouped, iqaNo)}
      title="Print"
      aria-label="Print checklist"
    >
 <i className="material-icons">print</i> Auditors Print
    </button>
  )}

  {selectedOption === 'S' && (
    <button
      onClick={() => AuditSchedulePrint(filScheduleList, iqaNo, iqaFromDate, iqaToDate)}
      title="Print"
      aria-label="Print AuditSchedule"
    >
      <i className="material-icons">print</i>Audit Schedule
    </button>
  )}



</div>
</div>

           
          <div className="team-list">
  {/* Auditor Teams Section */}
  
  
{/* {<Datatable columns={columns} data={filScheduleList} /> } */}
{selectedOption === 'A' ? (
               <Datatable columns={InAuditorTeamscolumns} data={tableBody} />
            ) : (
              <Datatable columns={columns} data={filScheduleList} />
                
            )}
</div>


        </div>
      </div>
    </div>
  );

};
export default AuditSummaryReport; 