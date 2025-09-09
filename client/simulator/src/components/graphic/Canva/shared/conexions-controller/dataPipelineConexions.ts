

//IF STAGE
export const pc_pc_ID = ["pivot1->pc_id"]
export const muxD_pc = ["muxD->pc_fe", "pc_fe->pc"]

export const pc_adder4 = ["pc->pivot25", "pivot25->pivot1", "pivot1->adder4"];
export const four_adder4 = ["four->adder4"];

export const pc_im = ["pc->pivot25", "pivot25->instMemory"];

export const adder4_muxD = [
    "adder4->pivot18",
    "pivot18->pivot19",
    "pivot19->muxD"
]




//IF-ID
export const im_instID = ["instructionMemory->inst_id"]
export const adder4_pcIncID = ["adder4->pivot18", "pivot18->pcinc_de"]

export const pcIncID_pcIncIE = ["pcinc_de->pcinc_ie"]
export const pcID_pcEX = ["pc_id->pc_ie"]


//ID STAGE

  //registers unit
export const im_rs1 = [
  "inst_id->pivot3",
  "pivot3->pivot22",
  "pivot22->pivot20",
  "pivot20->pivot21",
  "pivot21->RegistersUnit[19:15]",
];

export const im_rs2 = [
  "inst_id->pivot3",
  "pivot3->pivot22",
  "pivot22->pivot20",
  "pivot20->RegistersUnit[24:20]",
];


export const im_rd = [
  "inst_id->pivot3",
  "pivot3->pivot26",
  "pivot26->pivot38",
  "pivot38->rd_ie"
]


  //imm generator
export const im_immGen = [
  "pivot3->pivot26",
  "pivot26->pivotJump11",
  "pivotJump11->pivotJump1",
  "pivotJump1->immediateGenerator[31:7]",
];

export const immSrc_immGen = ["immSrc->immGenerator"];


 //control unit

export const im_opcode = [
  "inst_id->pivot3",
  "pivot3->pivot26",
  "pivot26->pivot38",
  "pivot38->pivot27",
  "pivot27->pivot28",
  "pivot28->pivot29",
];

export const im_funct3 = [
  "inst_id->pivot3",
  "pivot3->pivot26",
  "pivot26->pivot38",
  "pivot38->pivot27",
  "pivot27->pivot28",
  "pivot28->pivot29",
  "pivot28->pivot30",
  "pivot30->pivot31",
];

export const im_funct7 = [
  "inst_id->pivot3",
  "pivot3->pivot26",
  "pivot26->pivot38",
  "pivot38->pivot27",
  "pivot27->pivot28",
  "pivot28->pivot29",
  "pivot28->pivot30",
  "pivot30->pivot32",
  "pivot32->pivot33",
];




// ID-EX
export const ru_rurs1_IE = ["registersUnit->rurs1_ie"]
export const ru_rurs2_IE = ["registersUnit->rurs2_ie"]
export const immGen_immExit_IE= ["immGenerator->immext_ie"]



//EX STAGE
  //mux A
export const rs1_muxA = ["rurs1_ie->pivotJump4", "pivotJump4->pivot4", "pivot4->muxA"];
export const pc_muxA = [
  "pc_ie->pivotJump2",
  "pivot1->pivotJump2",
  "pivotJump2->pivotJump3",
  "pivotJump3->muxA",
];
export const aluASrc_muxA = ["aluASrc->muxA"];

  //mux b
export const rs2_muxB = ["rurs2_ie->pivot2", "pivot2->muxB"];
export const immGen_muxB = ["immext_ie->pivotJump5", "pivotJump5->pivot10", "pivot10->muxB"];
export const aluBSrc_muxB = ["aluBSrc->muxB"];


  //rs2_rus2_mem
export const rs2_ruRs2Mem = ["rurs2_ie->pivot2", "pivot2->pivot5", "pivot5->rurs2_mem"]



  //bu
export const RUrs1_bu = ["rurs1_ie->pivotJump4", "pivotJump4->pivot4", "pivot4->branchUnit"]
export const RUrs2_bu = ["rurs2_ie->pivot2", "pivot2->branchUnit"]


export const bu_muxD = [
    "branchUnit->pivot14",
    "pivot14->pivotJump10",
    "pivotJump10->pivot15",
    "pivot15->muxD"
]


 //alu

 export const alu_aluResMEM = ["alu->pivot7", "pivot7->alures_mem"]

 export const muxA_aluA = ["muxA->alu"]
 export const muxB_aluB = ["muxB->alu"]


 //MUX D
export const alu_muxD = [
    "alu->pivot7",
    "pivot7->pivot16",
    "pivot16->pivot17",
    "pivot17->muxD"
]




//EX-MEM

export const pcIncIE_pcIncMEM= ["pcinc_ie->pivotJump8", "pivotJump8->pivotJump9", "pivotJump9->pcinc_mem"]
export const rdIE_rdMEM = ["rd_ie->rd_mem"]



//MEM-WB

export const pcIncMEM_pcIncWB= ["pcinc_mem->pcinc_wb"]


//MEM

export const dmWr_dm = ["dmWr->dataMemory"];

export const dmCtrl_dm = ["dmCtrl->dataMemory"];

export const aluResMEM_dm = ["alures_mem->pivot34", "pivot34->dataMemory"]

export const RUrs2MEM_dm = [
  "rurs2_mem->pivot6",
  "pivot6->dataMemory",

];


export const AluResMEM_AluResWB = [
  "alures_mem->pivot34",
  "pivot34->pivot8",
  "pivot8->pivotJump6",
  "pivotJump6->alures_wb"
]


export const rdMEM_rdWB = [
  "rd_mem->rd_wb"
]


export const dm_dmDatardWB =[
  "dataMemory->dmdatard_wb"
]


//WB

export const pcIncWB_muxC = [
  "pcinc_wb->pivot13",
  "pivot13->muxC"
]

export const dmDatardWB_muxC = [
  "dmdatard_wb->muxC"

]


export const aluResWB_muxC = [
  "alures_wb->pivot9",
  "pivot9->muxC"
]


export const muxC_rd = ["muxC->pivot11", "pivot11->pivot12", "pivot12->registersUnit"];

export const rdWB_rd = ["rd_wb->pivot37", "pivot37->pivot36", "pivot36->pivot35", "pivot35->registersUnit[11:7]"]


export const ruDataWrSrc_muxC = ["ruDataWrSrc->muxC"]









