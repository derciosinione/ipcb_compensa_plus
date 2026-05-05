import svgPaths from "./svg-p1584vrgab";
import clsx from "clsx";
type CardProps = {
  additionalClassNames?: string;
};

function Card({ children, additionalClassNames = "" }: React.PropsWithChildren<CardProps>) {
  return (
    <div className={clsx("absolute bg-white h-[193px] left-0 rounded-[14px] w-[937px]", additionalClassNames)}>
      <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip p-px relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function CardContent({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[935px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pb-0 pt-[16px] px-[16px] relative size-full">{children}</div>
    </div>
  );
}

function Container8({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[16px] relative shrink-0 w-[88px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[2px] items-start relative size-full">{children}</div>
    </div>
  );
}
type Container7Props = {
  additionalClassNames?: string;
};

function Container7({ children, additionalClassNames = "" }: React.PropsWithChildren<Container7Props>) {
  return (
    <div className={clsx("h-[44px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">{children}</div>
    </div>
  );
}
type InputProps = {
  additionalClassNames?: string;
  text: string;
};

function Input({ children, additionalClassNames = "", text }: React.PropsWithChildren<InputProps>) {
  return (
    <div className={clsx("basis-0 grow h-[36px] min-h-px min-w-px relative rounded-[8px] shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">{text}</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container6({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 bg-[#f9fafb] grow min-h-px min-w-px relative shrink-0 w-[1016px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[32px] px-[32px] relative rounded-[inherit] size-full">{children}</div>
    </div>
  );
}

function Container5({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[#030213] h-[64px] relative shrink-0 w-[1016px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pl-[32px] pr-[32.016px] py-0 relative size-full">{children}</div>
    </div>
  );
}

function Container4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[20px] relative shrink-0 w-[189.047px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-start relative size-full">{children}</div>
    </div>
  );
}

function Container3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[32px] relative shrink-0 w-[149.156px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">{children}</div>
    </div>
  );
}

function Container2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute bg-white h-[768px] left-0 rounded-[10px] top-[100px] w-[1024px]">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[4px] relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border-4 border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" />
    </div>
  );
}
type CardHeaderProps = {
  additionalClassNames?: string;
};

function CardHeader({ children, additionalClassNames = "" }: React.PropsWithChildren<CardHeaderProps>) {
  return (
    <div className={clsx("h-[70px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid gap-[6px] grid grid-cols-[repeat(1,_minmax(0px,_1fr))] grid-rows-[minmax(0px,_16fr)_minmax(0px,_1fr)] pb-0 pt-[24px] px-[24px] relative size-full">{children}</div>
    </div>
  );
}

function Container1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[#f3f4f6] h-[40px] relative shrink-0 w-[1016px]">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center pb-px pt-0 px-[16px] relative size-full">{children}</div>
    </div>
  );
}

function Container({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[12px] relative shrink-0 w-[52px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-start relative size-full">{children}</div>
    </div>
  );
}

function Wrapper8({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
      <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">{children}</div>
    </div>
  );
}
type Wrapper7Props = {
  additionalClassNames?: string;
};

function Wrapper7({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper7Props>) {
  return (
    <div className={clsx("absolute size-[12px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        {children}
      </svg>
    </div>
  );
}
type Wrapper6Props = {
  additionalClassNames?: string;
};

function Wrapper6({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper6Props>) {
  return (
    <div className={clsx("h-[22px] relative rounded-[8px] shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}
type Wrapper5Props = {
  additionalClassNames?: string;
};

function Wrapper5({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper5Props>) {
  return (
    <div className={clsx("basis-0 grow min-h-px min-w-px relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type Wrapper4Props = {
  additionalClassNames?: string;
};

function Wrapper4({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper4Props>) {
  return (
    <div className={clsx("h-[20px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return (
    <div className={clsx("h-[24px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}

function Wrapper2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[868px] relative shrink-0 w-[1024px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return (
    <div className={clsx("size-[16px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        {children}
      </svg>
    </div>
  );
}
type Icon3Props = {
  additionalClassNames?: string;
};

function Icon3({ children, additionalClassNames = "" }: React.PropsWithChildren<Icon3Props>) {
  return (
    <div className={clsx("absolute left-0 size-[20px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <Wrapper1 additionalClassNames={additionalClassNames}>
      <g id="Icon">{children}</g>
    </Wrapper1>
  );
}

function Icon2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow h-[16px] min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[8.33%_8.33%_12.2%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-5.24%_-5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6679 14.048">
              {children}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <Wrapper additionalClassNames="relative shrink-0">
      <path d={svgPaths.pb3a1300} fill="var(--fill-0, #FDC700)" id="Vector" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}
type TextText7Props = {
  text: string;
};

function TextText7({ text }: TextText7Props) {
  return (
    <Wrapper4 additionalClassNames="w-[67.453px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#0a0a0a] text-[14px] top-px w-[68px]">{text}</p>
    </Wrapper4>
  );
}
type TextText6Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText6({ text, additionalClassNames = "" }: TextText6Props) {
  return (
    <div className={clsx("h-[20px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-0 tracking-[-0.1504px] w-[90px]">{text}</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <Wrapper additionalClassNames="relative shrink-0">
      <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}
type BadgeTextProps = {
  text: string;
};

function BadgeText({ text }: BadgeTextProps) {
  return (
    <Wrapper6 additionalClassNames="bg-[#eceef2] w-[75.703px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#030213] text-[12px] text-nowrap">{text}</p>
    </Wrapper6>
  );
}
type TextText5Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText5({ text, additionalClassNames = "" }: TextText5Props) {
  return (
    <div className={clsx("h-[16px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Wrapper7 additionalClassNames="left-0 top-[2px]">
          <g clipPath="url(#clip0_109_1846)" id="Icon">
            <path d="M6 3V6L8 7" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p3e7757b0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_109_1846">
              <rect fill="white" height="12" width="12" />
            </clipPath>
          </defs>
        </Wrapper7>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[16px] not-italic text-[#99a1af] text-[12px] text-nowrap top-0">{text}</p>
      </div>
    </div>
  );
}
type TextText4Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText4({ text, additionalClassNames = "" }: TextText4Props) {
  return (
    <div className={clsx("h-[20px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[24px] not-italic text-[#6a7282] text-[14px] text-center text-nowrap top-0 tracking-[-0.1504px] translate-x-[-50%]">{text}</p>
      </div>
    </div>
  );
}
type TextText3Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText3({ text, additionalClassNames = "" }: TextText3Props) {
  return (
    <div className={clsx("absolute content-stretch flex h-[17px] items-start top-px", additionalClassNames)}>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-nowrap tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type TextText2Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText2({ text, additionalClassNames = "" }: TextText2Props) {
  return (
    <div className={clsx("absolute content-stretch flex h-[17px] items-start left-0 top-px", additionalClassNames)}>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#6a7282] text-[14px] text-nowrap tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type Text6Props = {
  text: string;
  additionalClassNames?: string;
};

function Text6({ text, additionalClassNames = "" }: Text6Props) {
  return (
    <div className={clsx("bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full", additionalClassNames)}>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center text-nowrap tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type Text5Props = {
  text: string;
};

function Text5({ text }: Text5Props) {
  return (
    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#0a0a0a] text-[18px] text-nowrap top-0 tracking-[-0.4395px]">{text}</p>
    </div>
  );
}
type PrimitiveButtonTextProps = {
  text: string;
  additionalClassNames?: string;
};

function PrimitiveButtonText({ text, additionalClassNames = "" }: PrimitiveButtonTextProps) {
  return (
    <div className={clsx("absolute content-stretch flex h-[29px] items-center justify-center px-[9px] py-[5px] rounded-[14px] top-[3.5px]", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center text-nowrap tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type Text4Props = {
  text: string;
};

function Text4({ text }: Text4Props) {
  return (
    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-nowrap text-white top-0 tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="h-[20px] opacity-70 relative shrink-0 w-[52.891px]">
      <Text4 text={text} />
    </div>
  );
}
type TextText1Props = {
  text: string;
};

function TextText1({ text }: TextText1Props) {
  return (
    <Wrapper5 additionalClassNames="h-[28px]">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-nowrap text-white top-0 tracking-[-0.4395px]">{text}</p>
    </Wrapper5>
  );
}
type ButtonTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ButtonText({ text, additionalClassNames = "" }: ButtonTextProps) {
  return (
    <div className={clsx("absolute bg-[#030213] content-stretch flex h-[36px] items-center justify-center px-[16px] py-[8px] rounded-[8px]", additionalClassNames)}>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type Text3Props = {
  text: string;
};

function Text3({ text }: Text3Props) {
  return (
    <Wrapper8>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">{text}</p>
    </Wrapper8>
  );
}
type InputTextProps = {
  text: string;
};

function InputText({ text }: InputTextProps) {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[8px] shrink-0 w-full">
      <Text3 text={text} />
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}
type CardDescriptionTextProps = {
  text: string;
};

function CardDescriptionText({ text }: CardDescriptionTextProps) {
  return (
    <div className="[grid-area:2_/_1] place-self-stretch relative shrink-0">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#717182] text-[16px] text-nowrap top-0 tracking-[-0.3125px]">{text}</p>
    </div>
  );
}
type CardTitleTextProps = {
  text: string;
};

function CardTitleText({ text }: CardTitleTextProps) {
  return (
    <div className="[grid-area:1_/_1] place-self-stretch relative shrink-0">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-0 not-italic text-[#0a0a0a] text-[16px] text-nowrap top-0 tracking-[-0.3125px]">{text}</p>
    </div>
  );
}
type Icon2VectorProps = {
  additionalClassNames?: string;
};

function Icon2Vector({ additionalClassNames = "" }: Icon2VectorProps) {
  return (
    <div className={clsx("absolute", additionalClassNames)}>
      <div className="absolute inset-[-25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <path d={svgPaths.p168a3a80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
        </svg>
      </div>
    </div>
  );
}
type ContainerTextProps = {
  text: string;
};

function ContainerText({ text }: ContainerTextProps) {
  return (
    <div className="basis-0 bg-white grow h-[24px] min-h-px min-w-px relative rounded-[4px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[9px] py-px relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#99a1af] text-[12px] text-nowrap">{text}</p>
        </div>
      </div>
    </div>
  );
}
type Text2Props = {
  text: string;
};

function Text2({ text }: Text2Props) {
  return (
    <div className="h-[20px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type HeadingText1Props = {
  text: string;
};

function HeadingText1({ text }: HeadingText1Props) {
  return (
    <div className="h-[28px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[#101828] text-[18px] text-nowrap top-0 tracking-[-0.4395px]">{text}</p>
    </div>
  );
}
type HeadingTextProps = {
  text: string;
  additionalClassNames?: string;
};

function HeadingText({ text, additionalClassNames = "" }: HeadingTextProps) {
  return (
    <div className={clsx("h-[32px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[32px] left-0 not-italic text-[#1e2939] text-[24px] text-nowrap top-0 tracking-[0.0703px]">{text}</p>
      </div>
    </div>
  );
}
type TextTextProps = {
  text: string;
  additionalClassNames?: string;
};

function TextText({ text, additionalClassNames = "" }: TextTextProps) {
  return (
    <div className={clsx("h-[28px] relative rounded-[3.35544e+07px] shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-[16px] not-italic text-[14px] text-nowrap text-white top-[4px] tracking-[0.1996px] uppercase">{text}</p>
      </div>
    </div>
  );
}
type Text1Props = {
  text: string;
};

function Text1({ text }: Text1Props) {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-nowrap tracking-[-0.1504px]">{text}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="h-[868px] relative shrink-0 w-[48px]" data-name="Arrow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="relative shrink-0 size-[48px]" data-name="Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
            <g id="Icon">
              <path d="M10 24H38" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
              <path d="M24 10L38 24L24 38" id="Vector_2" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function StoryboardParaVoucherDigital() {
  return (
    <div className="bg-white relative size-full" data-name="Storyboard para Voucher Digital">
      <div className="absolute bg-[#f3f4f6] content-stretch flex flex-col h-[2186px] items-start left-0 overflow-clip pb-0 pt-[32px] px-[32px] top-0 w-[1536px]" data-name="StoryboardView">
        <div className="content-stretch flex flex-col gap-[48px] h-[2107px] items-start relative shrink-0 w-full" data-name="Container">
          <div className="content-stretch flex h-[84px] items-start justify-between relative shrink-0 w-full" data-name="Container">
            <div className="h-[84px] relative shrink-0 w-[705.688px]" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
                <div className="h-[40px] relative shrink-0 w-full" data-name="Heading 1">
                  <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-0 not-italic text-[#101828] text-[36px] text-nowrap top-0 tracking-[0.3691px]">Storyboard: Jornada do Usuário (Desktop)</p>
                </div>
                <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#4a5565] text-[20px] text-nowrap top-0 tracking-[-0.4492px]">Visualização do fluxo completo da aplicação Web de Car Pooling.</p>
                </div>
              </div>
            </div>
            <div className="bg-white h-[44.391px] relative rounded-[10px] shrink-0 w-[223.938px]" data-name="Container">
              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[13px] py-px relative size-full">
                <Wrapper1 additionalClassNames="relative shrink-0">
                  <g clipPath="url(#clip0_109_1901)" id="Icon">
                    <path d={svgPaths.p24613e80} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p3dd52f00} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p2d792300} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                  <defs>
                    <clipPath id="clip0_109_1901">
                      <rect fill="white" height="16" width="16" />
                    </clipPath>
                  </defs>
                </Wrapper1>
                <div className="basis-0 grow h-[14px] min-h-px min-w-px relative shrink-0" data-name="Primitive.label">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-nowrap tracking-[-0.1504px]">Modo Wireframe</p>
                  </div>
                </div>
                <div className="bg-[#cbced4] h-[18.391px] relative rounded-[3.35544e+07px] shrink-0 w-[32px]" data-name="Primitive.button">
                  <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[3.35544e+07px]" />
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center p-px relative size-full">
                    <div className="bg-white rounded-[3.35544e+07px] shrink-0 size-[16px]" data-name="Primitive.span" />
                  </div>
                </div>
                <Wrapper1 additionalClassNames="relative shrink-0">
                  <g clipPath="url(#clip0_109_1906)" id="Icon">
                    <path d={svgPaths.p3e496700} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p2c3f6760} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p1ac54b00} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p35126200} id="Vector_4" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                  <defs>
                    <clipPath id="clip0_109_1906">
                      <rect fill="white" height="16" width="16" />
                    </clipPath>
                  </defs>
                </Wrapper1>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] h-[971px] items-start relative shrink-0 w-full" data-name="Section">
            <div className="content-stretch flex gap-[16px] h-[32px] items-center relative shrink-0 w-full" data-name="Container">
              <TextText text="Jornada 1" additionalClassNames="bg-[#155dfc] w-[115.016px]" />
              <HeadingText text="Fluxo de Passageiro: Cadastro à Viagem" additionalClassNames="w-[433.547px]" />
            </div>
            <div className="content-stretch flex gap-[48px] h-[915px] items-start overflow-clip relative shrink-0 w-full" data-name="Container">
              <Wrapper2>
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[84px] items-start left-0 pb-0 pl-[20px] pr-[16px] pt-[16px] rounded-[10px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#2b7fff] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                  <HeadingText1 text="1. Cadastro Inicial" />
                  <Text2 text="Tela de login/cadastro centralizada." />
                </div>
                <Container2>
                  <Container1>
                    <Container>
                      <div className="bg-[#ff6467] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="bg-[#fdc700] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="basis-0 bg-[#05df72] grow h-[12px] min-h-px min-w-px rounded-[3.35544e+07px] shrink-0" data-name="Container" />
                    </Container>
                    <ContainerText text="https://voucherpool.app/dashboard" />
                  </Container1>
                  <div className="basis-0 bg-[#f9fafb] grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pl-[284px] pr-[348px] pt-[105px] relative rounded-[inherit] size-full">
                      <div className="bg-[#f9fafb] content-stretch flex flex-col gap-[24px] h-[510px] items-start relative shrink-0 w-full" data-name="RegisterScreen">
                        <div className="content-stretch flex flex-col gap-[8px] h-[124px] items-center relative shrink-0 w-full" data-name="Container">
                          <div className="basis-0 bg-[#030213] grow min-h-px min-w-px relative rounded-[3.35544e+07px] shrink-0 w-[56px]" data-name="Container">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[12px] px-[12px] relative size-full">
                              <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                                <div className="absolute inset-[29.17%_8.33%]" data-name="Vector">
                                  <div className="absolute inset-[-10%_-5%]">
                                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.3333 16">
                                      <path d={svgPaths.pb9bdf80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    </svg>
                                  </div>
                                </div>
                                <Icon2Vector additionalClassNames="inset-[62.5%_62.5%_20.83%_20.83%]" />
                                <div className="absolute inset-[70.83%_37.5%_29.17%_37.5%]" data-name="Vector">
                                  <div className="absolute inset-[-1.33px_-16.67%]">
                                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 2.66667">
                                      <path d="M1.33333 1.33333H9.33333" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    </svg>
                                  </div>
                                </div>
                                <Icon2Vector additionalClassNames="inset-[62.5%_20.83%_20.83%_62.5%]" />
                              </div>
                            </div>
                          </div>
                          <div className="h-[32px] relative shrink-0 w-[288.172px]" data-name="Heading 1">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                              <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[144px] not-italic text-[#0a0a0a] text-[24px] text-center text-nowrap top-0 tracking-[-0.5297px] translate-x-[-50%]">Bem-vindo ao VoucherPool</p>
                            </div>
                          </div>
                          <Wrapper4 additionalClassNames="w-[234.844px]">
                            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[117.5px] not-italic text-[#6a7282] text-[14px] text-center text-nowrap top-0 tracking-[-0.1504px] translate-x-[-50%]">Crie sua conta para começar a viajar</p>
                          </Wrapper4>
                        </div>
                        <div className="bg-white content-stretch flex flex-col gap-[24px] h-[362px] items-start p-px relative rounded-[14px] shrink-0 w-full" data-name="Card">
                          <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                          <CardHeader additionalClassNames="w-[382px]">
                            <CardTitleText text="Cadastro" />
                            <CardDescriptionText text="Preencha seus dados abaixo" />
                          </CardHeader>
                          <Wrapper5 additionalClassNames="w-[382px]">
                            <div className="absolute content-stretch flex flex-col gap-[16px] h-[206px] items-start left-0 px-[24px] py-0 top-0 w-[382px]" data-name="CardContent">
                              <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="RegisterScreen">
                                <Text1 text="Nome Completo" />
                                <InputText text="João Silva" />
                              </div>
                              <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="RegisterScreen">
                                <Text1 text="Email" />
                                <InputText text="joao@exemplo.com" />
                              </div>
                              <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="RegisterScreen">
                                <Text1 text="Telefone" />
                                <InputText text="(11) 99999-9999" />
                              </div>
                            </div>
                            <ButtonText text="Criar Conta" additionalClassNames="left-[24px] top-[206px] w-[334px]" />
                          </Wrapper5>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container2>
              </Wrapper2>
              <Arrow />
              <Wrapper2>
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[84px] items-start left-0 pb-0 pl-[20px] pr-[16px] pt-[16px] rounded-[10px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#2b7fff] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                  <HeadingText1 text="2. Carregamento de Saldo" />
                  <Text2 text="Painel da carteira com opções de recarga." />
                </div>
                <Container2>
                  <Container1>
                    <Container>
                      <div className="bg-[#ff6467] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="bg-[#fdc700] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="basis-0 bg-[#05df72] grow h-[12px] min-h-px min-w-px rounded-[3.35544e+07px] shrink-0" data-name="Container" />
                    </Container>
                    <ContainerText text="https://voucherpool.app/dashboard" />
                  </Container1>
                  <Container5>
                    <Container3>
                      <div className="bg-[rgba(255,255,255,0.2)] rounded-[4px] shrink-0 size-[32px]" data-name="Container" />
                      <TextText1 text="VoucherPool" />
                    </Container3>
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[35.125px]" data-name="Text">
                        <Text4 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text4 text="Carteira" />
                      </div>
                      <Text text="Viagens" />
                    </Container4>
                    <div className="bg-[rgba(255,255,255,0.2)] rounded-[3.35544e+07px] shrink-0 size-[32px]" data-name="Container" />
                  </Container5>
                  <Container6>
                    <div className="content-stretch flex flex-col gap-[24px] h-[456px] items-start relative shrink-0 w-full" data-name="WalletScreen">
                      <div className="bg-[#030213] content-stretch flex flex-col gap-[8px] h-[124px] items-center justify-center pb-0 pt-[8px] px-0 relative rounded-[14px] shrink-0 w-full" data-name="CardContent">
                        <div className="h-[20px] opacity-80 relative shrink-0 w-[109.266px]" data-name="WalletScreen">
                          <Text4 text="Saldo Disponível" />
                        </div>
                        <div className="h-[40px] relative shrink-0 w-[134.125px]" data-name="WalletScreen">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                            <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-0 not-italic text-[36px] text-white top-0 tracking-[0.3691px] w-[135px]">R$ 0.00</p>
                          </div>
                        </div>
                      </div>
                      <div className="content-stretch flex flex-col gap-[16px] h-[308px] items-start relative shrink-0 w-full" data-name="Container">
                        <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 2">
                          <Icon3 additionalClassNames="top-[4px]">
                            <path d={svgPaths.p3e8f800} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                            <path d={svgPaths.p11d57a00} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                          </Icon3>
                          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-[28px] not-italic text-[#0a0a0a] text-[18px] text-nowrap top-0 tracking-[-0.4395px]">Carregar Saldo</p>
                        </div>
                        <div className="content-stretch flex flex-col gap-[24px] h-[264px] items-start relative shrink-0 w-full" data-name="Primitive.div">
                          <div className="bg-[#ececf0] h-[36px] relative rounded-[14px] shrink-0 w-[952px]" data-name="Tab List">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                              <PrimitiveButtonText text="Banco" additionalClassNames="bg-white left-[3px] w-[315.328px]" />
                              <PrimitiveButtonText text="Móvel" additionalClassNames="left-[318.33px] w-[315.328px]" />
                              <PrimitiveButtonText text="Espécie" additionalClassNames="left-[633.66px] w-[315.344px]" />
                            </div>
                          </div>
                          <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[10px] shrink-0 w-[952px]" data-name="WalletScreen">
                            <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[10px]" />
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-px pt-[17px] px-[17px] relative size-full">
                              <div className="content-stretch flex flex-col h-[50px] items-start relative shrink-0 w-full" data-name="Container">
                                <Text1 text="Valor da Recarga (R$)" />
                                <InputText text="0.00" />
                              </div>
                              <div className="content-stretch flex flex-col gap-[16px] h-[104px] items-start relative shrink-0 w-full" data-name="Primitive.div">
                                <div className="bg-[#f9fafb] h-[52px] relative rounded-[8px] shrink-0 w-full" data-name="WalletScreen">
                                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[16px] tracking-[-0.1504px]">Transfira para a chave PIX:</p>
                                  <div className="absolute content-stretch flex h-[17px] items-start left-[191.66px] top-[17px] w-[132.563px]" data-name="Bold Text">
                                    <p className="font-['Inter:Bold',sans-serif] font-bold leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px] text-nowrap tracking-[-0.1504px]">voucher@pool.com</p>
                                  </div>
                                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[324.22px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[16px] tracking-[-0.1504px]">e aguarde a confirmação.</p>
                                </div>
                                <div className="bg-[#030213] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
                                  <Wrapper additionalClassNames="absolute left-[363.09px] top-[10px]">
                                    <path d={svgPaths.p35993080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                    <path d="M1.33333 6.66667H14.6667" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                  </Wrapper>
                                  <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[475.59px] not-italic text-[14px] text-center text-nowrap text-white top-[8px] tracking-[-0.1504px] translate-x-[-50%]">Confirmar Transferência</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Container6>
                </Container2>
              </Wrapper2>
              <Arrow />
              <Wrapper2>
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[84px] items-start left-0 pb-0 pl-[20px] pr-[16px] pt-[16px] rounded-[10px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#2b7fff] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                  <HeadingText1 text="3. Pesquisa de Viagem" />
                  <Text2 text="Interface de busca expandida." />
                </div>
                <Container2>
                  <Container1>
                    <Container>
                      <div className="bg-[#ff6467] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="bg-[#fdc700] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="basis-0 bg-[#05df72] grow h-[12px] min-h-px min-w-px rounded-[3.35544e+07px] shrink-0" data-name="Container" />
                    </Container>
                    <ContainerText text="https://voucherpool.app/dashboard" />
                  </Container1>
                  <Container5>
                    <Container3>
                      <div className="bg-[rgba(255,255,255,0.2)] rounded-[4px] shrink-0 size-[32px]" data-name="Container" />
                      <TextText1 text="VoucherPool" />
                    </Container3>
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[35.125px]" data-name="Text">
                        <Text4 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text4 text="Carteira" />
                      </div>
                      <Text text="Viagens" />
                    </Container4>
                    <div className="bg-[rgba(255,255,255,0.2)] rounded-[3.35544e+07px] shrink-0 size-[32px]" data-name="Container" />
                  </Container5>
                  <Container6>
                    <div className="content-stretch flex flex-col gap-[24px] h-[338px] items-start relative shrink-0 w-full" data-name="SearchScreen">
                      <div className="bg-white h-[220px] relative rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0 w-full" data-name="Container">
                        <div className="content-stretch flex flex-col gap-[16px] items-start pb-0 pt-[16px] px-[16px] relative size-full">
                          <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 2">
                            <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#0a0a0a] text-[18px] text-nowrap top-0 tracking-[-0.4395px]">Para onde vamos?</p>
                          </div>
                          <div className="h-[84px] relative shrink-0 w-full" data-name="Container">
                            <div className="absolute content-stretch flex flex-col gap-[12px] h-[84px] items-start left-[24px] top-0 w-[896px]" data-name="Container">
                              <div className="bg-[#f9fafb] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
                                <Text3 text="De onde sair?" />
                              </div>
                              <div className="bg-[#f9fafb] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
                                <Text3 text="Para onde ir?" />
                              </div>
                            </div>
                            <div className="absolute bg-[#e5e7eb] content-stretch flex flex-col gap-[32px] h-[52px] items-start left-[12px] px-[-4px] py-0 top-[12px] w-[2px]" data-name="Container">
                              <div className="bg-[#030213] h-[10px] rounded-[3.35544e+07px] shadow-[0px_0px_0px_4px_white] shrink-0 w-full" data-name="Container" />
                              <div className="bg-black h-[10px] shadow-[0px_0px_0px_4px_white] shrink-0 w-full" data-name="Container" />
                            </div>
                          </div>
                          <div className="bg-[#030213] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
                            <Wrapper additionalClassNames="absolute left-[392.8px] top-[10px]">
                              <path d="M13.9999 14L11.1066 11.1066" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                              <path d={svgPaths.p107a080} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                            </Wrapper>
                            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[476.3px] not-italic text-[14px] text-center text-nowrap text-white top-[8px] tracking-[-0.1504px] translate-x-[-50%]">Buscar Viagens</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white h-[94px] relative rounded-[14px] shrink-0 w-full" data-name="Container">
                        <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                        <div className="content-stretch flex flex-col gap-[8px] items-start pb-px pt-[17px] px-[17px] relative size-full">
                          <div className="content-stretch flex h-[16px] items-center relative shrink-0 w-full" data-name="Primitive.label">
                            <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#6a7282] text-[12px] tracking-[0.6px] uppercase">Pagamento Offline / Terceiros</p>
                          </div>
                          <div className="content-stretch flex gap-[8px] h-[36px] items-start relative shrink-0 w-full" data-name="Container">
                            <Input additionalClassNames="bg-[#f9fafb]" text="ID da Conta (Opcional)" />
                            <div className="bg-white h-[36px] relative rounded-[8px] shrink-0 w-[89.313px]" data-name="Button">
                              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                              <Text6 text="Verificar" additionalClassNames="px-[17px] py-[9px]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Container6>
                </Container2>
              </Wrapper2>
              <Arrow />
              <Wrapper2>
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[84px] items-start left-0 pb-0 pl-[20px] pr-[16px] pt-[16px] rounded-[10px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#2b7fff] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                  <HeadingText1 text="4. Confirmação de Pagamento" />
                  <Text2 text="Checkout com revisão de detalhes." />
                </div>
                <Container2>
                  <Container1>
                    <Container>
                      <div className="bg-[#ff6467] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="bg-[#fdc700] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="basis-0 bg-[#05df72] grow h-[12px] min-h-px min-w-px rounded-[3.35544e+07px] shrink-0" data-name="Container" />
                    </Container>
                    <ContainerText text="https://voucherpool.app/dashboard" />
                  </Container1>
                  <Container5>
                    <Container3>
                      <div className="bg-[rgba(255,255,255,0.2)] rounded-[4px] shrink-0 size-[32px]" data-name="Container" />
                      <TextText1 text="VoucherPool" />
                    </Container3>
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[35.125px]" data-name="Text">
                        <Text4 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text4 text="Carteira" />
                      </div>
                      <Text text="Viagens" />
                    </Container4>
                    <div className="bg-[rgba(255,255,255,0.2)] rounded-[3.35544e+07px] shrink-0 size-[32px]" data-name="Container" />
                  </Container5>
                  <div className="basis-0 bg-[#f9fafb] grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pl-[164.5px] pr-[179.5px] pt-[32px] relative rounded-[inherit] size-full">
                      <div className="bg-white h-[661px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
                        <div className="overflow-clip relative rounded-[inherit] size-full">
                          <div className="absolute bg-[rgba(3,2,19,0.1)] content-stretch flex flex-col gap-[4px] h-[112px] items-center justify-center left-px top-px w-[670px]" data-name="PaymentScreen">
                            <Wrapper4 additionalClassNames="w-[130.797px]">
                              <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[65px] not-italic text-[#030213] text-[14px] text-center text-nowrap top-0 tracking-[0.1996px] translate-x-[-50%] uppercase">Valor da Viagem</p>
                            </Wrapper4>
                            <div className="h-[40px] relative shrink-0 w-[157.406px]" data-name="Container">
                              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[79px] not-italic text-[#030213] text-[36px] text-center top-0 tracking-[0.3691px] translate-x-[-50%] w-[158px]">R$ 45.00</p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute h-[28px] left-[25px] top-[161px] w-[622px]" data-name="CardTitle">
                            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0a0a0a] text-[18px] text-nowrap top-0 tracking-[-0.4395px]">Detalhes da Viagem</p>
                          </div>
                          <div className="absolute content-stretch flex flex-col gap-[16px] h-[297px] items-start left-px px-[24px] py-0 top-[219px] w-[670px]" data-name="CardContent">
                            <div className="h-[44px] relative shrink-0 w-full" data-name="PaymentScreen">
                              <div className="absolute left-0 size-[20px] top-[2px]" data-name="Icon">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                                  <g clipPath="url(#clip0_109_1895)" id="Icon">
                                    <path d="M10 5V10L13.3333 11.6667" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                    <path d={svgPaths.p14d24500} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_109_1895">
                                      <rect fill="white" height="20" width="20" />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </div>
                              <div className="absolute content-stretch flex flex-col h-[44px] items-start left-[32px] top-0 w-[42.219px]" data-name="Container">
                                <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
                                  <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] text-nowrap top-0 tracking-[-0.3125px]">14:30</p>
                                </div>
                                <Text2 text="Hoje" />
                              </div>
                            </div>
                            <div className="h-[44px] relative shrink-0 w-full" data-name="PaymentScreen">
                              <Icon3 additionalClassNames="top-[2px]">
                                <path d={svgPaths.p26ddc800} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                <path d={svgPaths.p35ba4680} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                              </Icon3>
                              <div className="absolute content-stretch flex flex-col gap-[4px] h-[44px] items-start left-[32px] top-0 w-[102.078px]" data-name="Container">
                                <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
                                  <TextText2 text="De:" additionalClassNames="w-[21.875px]" />
                                  <TextText3 text="São Paulo" additionalClassNames="left-[25.67px] w-[65.078px]" />
                                </div>
                                <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
                                  <TextText2 text="Para:" additionalClassNames="w-[32.813px]" />
                                  <TextText3 text="Campinas" additionalClassNames="left-[36.61px] w-[65.469px]" />
                                </div>
                              </div>
                            </div>
                            <div className="h-[48px] relative shrink-0 w-full" data-name="PaymentScreen">
                              <Icon3 additionalClassNames="top-[2px]">
                                <path d={svgPaths.p1beb9580} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                                <path d={svgPaths.p32ab0300} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                              </Icon3>
                              <div className="absolute h-[48px] left-[32px] top-0 w-[67.172px]" data-name="Container">
                                <div className="absolute h-[24px] left-0 top-0 w-[67.172px]" data-name="Container">
                                  <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] text-nowrap top-0 tracking-[-0.3125px]">Carlos A.</p>
                                </div>
                                <div className="absolute bg-[#fef9c2] h-[20px] left-0 rounded-[4px] top-[28px] w-[48.516px]" data-name="Container">
                                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[6px] not-italic text-[#894b00] text-[12px] top-[2px] w-[37px]">⭐ 4.8</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-[rgba(0,0,0,0.1)] h-px shrink-0 w-full" data-name="Primitive.div" />
                            <div className="content-stretch flex h-[40px] items-center justify-between relative shrink-0 w-full" data-name="PaymentScreen">
                              <Wrapper3 additionalClassNames="w-[113.672px]">
                                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-0 tracking-[-0.3125px]">Seu Saldo Atual</p>
                              </Wrapper3>
                              <Wrapper3 additionalClassNames="w-[77.281px]">
                                <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] top-0 tracking-[-0.3125px] w-[78px]">R$ 100.00</p>
                              </Wrapper3>
                            </div>
                            <div className="bg-[#eff6ff] h-[40px] relative rounded-[8px] shrink-0 w-full" data-name="PaymentScreen">
                              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[12px] not-italic text-[#155dfc] text-[12px] text-nowrap top-[12px]">Pagamento vinculado ao ID Offline:</p>
                              <div className="absolute content-stretch flex h-[15px] items-start left-[213.8px] top-[12px] w-[51.484px]" data-name="Bold Text">
                                <p className="font-['Inter:Bold',sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[#155dfc] text-[12px] text-nowrap">OFF-123</p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute content-stretch flex flex-col gap-[12px] h-[120px] items-center left-px pb-[24px] pt-0 px-0 top-[540px] w-[670px]" data-name="CardFooter">
                            <div className="bg-[#030213] h-[48px] relative rounded-[8px] shrink-0 w-[622px]" data-name="Button">
                              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
                                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[18px] text-center text-nowrap text-white tracking-[-0.4395px]">Confirmar Pagamento</p>
                              </div>
                            </div>
                            <div className="h-[36px] relative rounded-[8px] shrink-0 w-[622px]" data-name="Button">
                              <Text6 text="Cancelar" additionalClassNames="px-[16px] py-[8px]" />
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                      </div>
                    </div>
                  </div>
                </Container2>
              </Wrapper2>
              <Arrow />
              <Wrapper2>
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[84px] items-start left-0 pb-0 pl-[20px] pr-[16px] pt-[16px] rounded-[10px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#2b7fff] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                  <HeadingText1 text="5. Voucher Gerado" />
                  <Text2 text="Voucher de sucesso." />
                </div>
                <Container2>
                  <Container1>
                    <Container>
                      <div className="bg-[#ff6467] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="bg-[#fdc700] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="basis-0 bg-[#05df72] grow h-[12px] min-h-px min-w-px rounded-[3.35544e+07px] shrink-0" data-name="Container" />
                    </Container>
                    <ContainerText text="https://voucherpool.app/dashboard" />
                  </Container1>
                  <Container5>
                    <Container3>
                      <div className="bg-[rgba(255,255,255,0.2)] rounded-[4px] shrink-0 size-[32px]" data-name="Container" />
                      <TextText1 text="VoucherPool" />
                    </Container3>
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[35.125px]" data-name="Text">
                        <Text4 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text4 text="Carteira" />
                      </div>
                      <Text text="Viagens" />
                    </Container4>
                    <div className="bg-[rgba(255,255,255,0.2)] rounded-[3.35544e+07px] shrink-0 size-[32px]" data-name="Container" />
                  </Container5>
                  <div className="basis-0 bg-[#f9fafb] grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pl-[212.5px] pr-[227.5px] pt-[72px] relative rounded-[inherit] size-full">
                      <div className="h-[586px] relative shrink-0 w-full" data-name="ConfirmationScreen">
                        <div className="absolute content-stretch flex flex-col gap-[8px] h-[64px] items-start left-[152.14px] top-[128px] w-[271.703px]" data-name="Container">
                          <div className="h-[32px] relative shrink-0 w-full" data-name="Heading 2">
                            <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[136.42px] not-italic text-[#101828] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%]">Viagem Confirmada!</p>
                          </div>
                          <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
                            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[136px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-0 tracking-[-0.3125px] translate-x-[-50%]">Seu voucher foi gerado com sucesso.</p>
                          </div>
                        </div>
                        <div className="absolute bg-[rgba(249,250,251,0.5)] content-stretch flex flex-col h-[294px] items-start left-0 p-[2px] rounded-[14px] top-[224px] w-[576px]" data-name="Card">
                          <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                          <Wrapper5 additionalClassNames="w-[572px]">
                            <div className="absolute content-stretch flex h-[24px] items-center justify-between left-[24px] top-[24px] w-[524px]" data-name="ConfirmationScreen">
                              <TextText4 text="Origem" additionalClassNames="w-[47.406px]" />
                              <Wrapper3 additionalClassNames="w-[74.5px]">
                                <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-[37px] not-italic text-[#0a0a0a] text-[16px] text-center text-nowrap top-0 tracking-[-0.3125px] translate-x-[-50%]">São Paulo</p>
                              </Wrapper3>
                            </div>
                            <div className="absolute content-stretch flex h-[24px] items-center justify-between left-[24px] top-[64px] w-[524px]" data-name="ConfirmationScreen">
                              <Wrapper4 additionalClassNames="w-[49.375px]">
                                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[25px] not-italic text-[#6a7282] text-[14px] text-center text-nowrap top-0 tracking-[-0.1504px] translate-x-[-50%]">Destino</p>
                              </Wrapper4>
                              <Wrapper3 additionalClassNames="w-[75.469px]">
                                <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-[38px] not-italic text-[#0a0a0a] text-[16px] text-center text-nowrap top-0 tracking-[-0.3125px] translate-x-[-50%]">Campinas</p>
                              </Wrapper3>
                            </div>
                            <div className="absolute content-stretch flex h-[24px] items-center justify-between left-[24px] top-[104px] w-[524px]" data-name="ConfirmationScreen">
                              <TextText4 text="Horário" additionalClassNames="w-[47.734px]" />
                              <Wrapper3 additionalClassNames="w-[43.453px]">
                                <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-[22.5px] not-italic text-[#0a0a0a] text-[16px] text-center text-nowrap top-0 tracking-[-0.3125px] translate-x-[-50%]">14:30</p>
                              </Wrapper3>
                            </div>
                            <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[74px] left-[261px] rounded-[4px] top-[160px] w-[50px]" data-name="ConfirmationScreen">
                              <div className="absolute left-[8px] size-[32px] top-[8px]" data-name="Icon">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                                  <g id="Icon">
                                    <path d={svgPaths.p4f17080} id="Vector" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    <path d="M17.3333 6.66667V9.33333" id="Vector_2" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    <path d="M17.3333 22.6667V25.3333" id="Vector_3" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                    <path d="M17.3333 14.6667V17.3333" id="Vector_4" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                                  </g>
                                </svg>
                              </div>
                              <div className="absolute bg-black h-[4px] left-[8px] top-[44px] w-[32px]" data-name="Container" />
                              <div className="absolute bg-black h-[4px] left-[8px] top-[52px] w-[21.328px]" data-name="Container" />
                              <div className="absolute bg-black h-[4px] left-[8px] top-[60px] w-[32px]" data-name="Container" />
                            </div>
                            <div className="absolute h-[16px] left-[24px] top-[250px] w-[524px]" data-name="ConfirmationScreen">
                              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[262.13px] not-italic text-[#99a1af] text-[12px] text-center top-px translate-x-[-50%] w-[87px]">ID: 1-586914</p>
                            </div>
                          </Wrapper5>
                        </div>
                        <ButtonText text="Voltar ao Início" additionalClassNames="left-0 top-[550px] w-[576px]" />
                        <div className="absolute left-[240px] size-[96px] top-0" data-name="Container">
                          <div className="absolute bg-[#b9f8cf] blur-xl filter left-0 opacity-50 rounded-[3.35544e+07px] size-[96px] top-0" data-name="ConfirmationScreen" />
                          <div className="absolute left-0 size-[96px] top-0" data-name="Icon">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96 96">
                              <g id="Icon">
                                <path d={svgPaths.p91acb00} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
                                <path d="M36 48L44 56L60 40" id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
                              </g>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container2>
              </Wrapper2>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] h-[956px] items-start relative shrink-0 w-full" data-name="Section">
            <div className="content-stretch flex gap-[16px] h-[32px] items-center relative shrink-0 w-full" data-name="Container">
              <TextText text="Telas de Suporte" additionalClassNames="bg-[#4a5565] w-[175.797px]" />
              <HeadingText text="Gestão e Agente" additionalClassNames="w-[180.313px]" />
            </div>
            <div className="content-stretch flex gap-[48px] h-[900px] items-start relative shrink-0 w-full" data-name="Container">
              <Wrapper2>
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[84px] items-start left-0 pb-0 pl-[20px] pr-[16px] pt-[16px] rounded-[10px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#2b7fff] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                  <HeadingText1 text="Histórico de Viagens" />
                  <Text2 text="Grade de viagens realizadas." />
                </div>
                <Container2>
                  <Container1>
                    <Container>
                      <div className="bg-[#ff6467] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="bg-[#fdc700] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="basis-0 bg-[#05df72] grow h-[12px] min-h-px min-w-px rounded-[3.35544e+07px] shrink-0" data-name="Container" />
                    </Container>
                    <ContainerText text="https://voucherpool.app/dashboard" />
                  </Container1>
                  <Container5>
                    <Container3>
                      <div className="bg-[rgba(255,255,255,0.2)] rounded-[4px] shrink-0 size-[32px]" data-name="Container" />
                      <TextText1 text="VoucherPool" />
                    </Container3>
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[35.125px]" data-name="Text">
                        <Text4 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text4 text="Carteira" />
                      </div>
                      <Text text="Viagens" />
                    </Container4>
                    <div className="bg-[rgba(255,255,255,0.2)] rounded-[3.35544e+07px] shrink-0 size-[32px]" data-name="Container" />
                  </Container5>
                  <div className="basis-0 bg-[#f9fafb] grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pl-[32px] pr-[47px] pt-[32px] relative rounded-[inherit] size-full">
                      <div className="content-stretch flex flex-col gap-[24px] h-[723px] items-start relative shrink-0 w-full" data-name="HistoryScreen">
                        <div className="h-[32px] relative shrink-0 w-full" data-name="Heading 2">
                          <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[4px] not-italic text-[#0a0a0a] text-[24px] text-nowrap top-0 tracking-[-0.5297px]">Minhas Viagens</p>
                        </div>
                        <div className="h-[667px] relative shrink-0 w-full" data-name="Container">
                          <Card additionalClassNames="top-0">
                            <div className="bg-[#00c950] h-[6px] shrink-0 w-[935px]" data-name="HistoryScreen" />
                            <CardContent>
                              <div className="content-stretch flex h-[44px] items-start justify-between relative shrink-0 w-full" data-name="HistoryScreen">
                                <Container7 additionalClassNames="w-[83.859px]">
                                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[83.859px]" data-name="Text">
                                    <Text5 text="Campinas" />
                                  </div>
                                  <TextText5 text="05/01/2024" additionalClassNames="w-[83.859px]" />
                                </Container7>
                                <BadgeText text="Concluída" />
                              </div>
                              <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="HistoryScreen">
                                <Icon />
                                <TextText6 text="De: São Paulo" additionalClassNames="w-[89.5px]" />
                              </div>
                              <div className="content-stretch flex h-[33px] items-center justify-between pb-0 pt-px px-0 relative shrink-0 w-full" data-name="HistoryScreen">
                                <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
                                <TextText7 text="R$ 45.00" />
                                <Container8>
                                  {[...Array(4).keys()].map((_, i) => (
                                    <Icon1 />
                                  ))}
                                  <Icon2>
                                    <path d={svgPaths.p1416a00} fill="var(--fill-0, #FDC700)" id="Vector" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                  </Icon2>
                                </Container8>
                              </div>
                            </CardContent>
                          </Card>
                          <Card additionalClassNames="top-[209px]">
                            <div className="bg-[#00c950] h-[6px] shrink-0 w-[935px]" data-name="HistoryScreen" />
                            <CardContent>
                              <div className="content-stretch flex h-[44px] items-start justify-between relative shrink-0 w-full" data-name="HistoryScreen">
                                <Container7 additionalClassNames="w-[82.656px]">
                                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[82.656px]" data-name="Text">
                                    <Text5 text="São Paulo" />
                                  </div>
                                  <TextText5 text="02/01/2024" additionalClassNames="w-[82.656px]" />
                                </Container7>
                                <BadgeText text="Concluída" />
                              </div>
                              <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="HistoryScreen">
                                <Icon />
                                <Wrapper4 additionalClassNames="w-[70.172px]">
                                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-0 tracking-[-0.1504px] w-[71px]">De: Santos</p>
                                </Wrapper4>
                              </div>
                              <div className="content-stretch flex h-[33px] items-center justify-between pb-0 pt-px px-0 relative shrink-0 w-full" data-name="HistoryScreen">
                                <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
                                <TextText7 text="R$ 30.00" />
                                <Container8>
                                  {[...Array(4).keys()].map((_, i) => (
                                    <Icon1 />
                                  ))}
                                  <Icon2>
                                    <path d={svgPaths.p1416a00} id="Vector" stroke="var(--stroke-0, #E5E7EB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                  </Icon2>
                                </Container8>
                              </div>
                            </CardContent>
                          </Card>
                          <Card additionalClassNames="top-[418px]">
                            <div className="bg-[#ff6467] h-[6px] shrink-0 w-[935px]" data-name="HistoryScreen" />
                            <CardContent>
                              <div className="content-stretch flex h-[44px] items-start justify-between relative shrink-0 w-full" data-name="HistoryScreen">
                                <Container7 additionalClassNames="w-[82.656px]">
                                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[82.656px]" data-name="Text">
                                    <Text5 text="São Paulo" />
                                  </div>
                                  <TextText5 text="28/12/2023" additionalClassNames="w-[82.656px]" />
                                </Container7>
                                <Wrapper6 additionalClassNames="bg-[#d4183d] w-[78.719px]">
                                  <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-white">Cancelada</p>
                                </Wrapper6>
                              </div>
                              <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="HistoryScreen">
                                <Icon />
                                <TextText6 text="De: Campinas" additionalClassNames="w-[89.625px]" />
                              </div>
                              <div className="h-[33px] relative shrink-0 w-full" data-name="HistoryScreen">
                                <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
                                <div className="flex flex-row items-center size-full">
                                  <div className="content-stretch flex items-center justify-between pb-0 pl-0 pr-[835.547px] pt-px relative size-full">
                                    <TextText7 text="R$ 42.00" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <div className="absolute content-stretch flex h-[15px] items-start left-[403.66px] top-[649px] w-[129.672px]" data-name="Text">
                            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#99a1af] text-[12px] text-center text-nowrap tracking-[1.2px] uppercase">Fim do histórico</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container2>
              </Wrapper2>
              <Wrapper2>
                <div className="absolute bg-white content-stretch flex flex-col gap-[4px] h-[84px] items-start left-0 pb-0 pl-[20px] pr-[16px] pt-[16px] rounded-[10px] top-0 w-[1024px]" data-name="Container">
                  <div aria-hidden="true" className="absolute border-[#2b7fff] border-[0px_0px_0px_4px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                  <HeadingText1 text="Visão do Agente Autorizado" />
                  <Text2 text="Interface administrativa para agentes." />
                </div>
                <Container2>
                  <Container1>
                    <Container>
                      <div className="bg-[#ff6467] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="bg-[#fdc700] rounded-[3.35544e+07px] shrink-0 size-[12px]" data-name="Container" />
                      <div className="basis-0 bg-[#05df72] grow h-[12px] min-h-px min-w-px rounded-[3.35544e+07px] shrink-0" data-name="Container" />
                    </Container>
                    <ContainerText text="https://voucherpool.app/dashboard" />
                  </Container1>
                  <Container5>
                    <Container3>
                      <div className="bg-[rgba(255,255,255,0.2)] rounded-[4px] shrink-0 size-[32px]" data-name="Container" />
                      <TextText1 text="VoucherPool" />
                    </Container3>
                    <Container4>
                      <div className="h-[20px] relative shrink-0 w-[35.125px]" data-name="Text">
                        <Text4 text="Início" />
                      </div>
                      <div className="basis-0 grow h-[20px] min-h-px min-w-px opacity-70 relative shrink-0" data-name="Text">
                        <Text4 text="Carteira" />
                      </div>
                      <Text text="Viagens" />
                    </Container4>
                    <div className="bg-[rgba(255,255,255,0.2)] rounded-[3.35544e+07px] shrink-0 size-[32px]" data-name="Container" />
                  </Container5>
                  <div className="basis-0 bg-[#f9fafb] grow min-h-px min-w-px relative shrink-0 w-[1016px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[32px] px-[172px] relative rounded-[inherit] size-full">
                      <div className="content-stretch flex flex-col gap-[24px] h-[453px] items-start relative shrink-0 w-full" data-name="AgentScreen">
                        <div className="content-stretch flex h-[28px] items-center justify-between relative shrink-0 w-full" data-name="Container">
                          <div className="h-[28px] relative shrink-0 w-[157.469px]" data-name="Heading 2">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                              <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[#0a0a0a] text-[20px] text-nowrap top-0 tracking-[-0.4492px]">Painel do Agente</p>
                            </div>
                          </div>
                          <div className="bg-[#f0fdf4] h-[22px] relative rounded-[8px] shrink-0 w-[100.875px]" data-name="Badge">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
                              <Wrapper7 additionalClassNames="left-[9px] top-[5px]">
                                <g id="Icon">
                                  <path d="M8 5.5L9 6.5L11 4.5" id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d={svgPaths.p38fdee00} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d={svgPaths.p13058e80} id="Vector_3" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                              </Wrapper7>
                              <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[29px] not-italic text-[#00a63e] text-[12px] text-nowrap top-[3px]">Autorizado</p>
                            </div>
                            <div aria-hidden="true" className="absolute border border-[#00a63e] border-solid inset-0 pointer-events-none rounded-[8px]" />
                          </div>
                        </div>
                        <div className="bg-white content-stretch flex flex-col gap-[24px] h-[323px] items-start pb-px pt-[4px] px-px relative rounded-[14px] shrink-0 w-full" data-name="Card">
                          <div aria-hidden="true" className="absolute border-[4px_1px_1px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
                          <CardHeader additionalClassNames="w-[670px]">
                            <CardTitleText text="Recarga de Saldo" />
                            <CardDescriptionText text="Insira o ID do usuário e o valor pago em espécie." />
                          </CardHeader>
                          <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[670px]" data-name="CardContent">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start px-[24px] py-0 relative size-full">
                              <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="AgentScreen">
                                <Text1 text="ID do Usuário / Código QR" />
                                <div className="content-stretch flex gap-[8px] h-[36px] items-start relative shrink-0 w-full" data-name="Container">
                                  <Input additionalClassNames="bg-[#f3f3f5]" text="Ex: USER-123" />
                                  <div className="bg-white relative rounded-[8px] shrink-0 size-[36px]" data-name="Button">
                                    <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
                                      <Wrapper additionalClassNames="relative shrink-0">
                                        <path d={svgPaths.p10a90f00} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d={svgPaths.p56e5b00} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d={svgPaths.p16b80040} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d={svgPaths.p613b980} id="Vector_4" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d="M14 14V14.0067" id="Vector_5" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d={svgPaths.pa2dba80} id="Vector_6" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d="M2 8H2.00667" id="Vector_7" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d="M8 2H8.00667" id="Vector_8" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d="M8 10.6667V10.6733" id="Vector_9" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d="M10.6667 8H11.3333" id="Vector_10" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d="M14 8V8.00667" id="Vector_11" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                        <path d="M8 14V13.3333" id="Vector_12" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                      </Wrapper>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="AgentScreen">
                                <Text1 text="Valor (R$)" />
                                <div className="bg-[#f3f3f5] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
                                  <Wrapper8>
                                    <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px]">0.00</p>
                                  </Wrapper8>
                                  <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                                </div>
                              </div>
                              <div className="bg-[#00a63e] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
                                <Wrapper additionalClassNames="absolute left-[233.05px] top-[10px]">
                                  <path d={svgPaths.p26ef3000} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                  <path d={svgPaths.p18635ff0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                  <path d="M4 8H4.00667M12 8H12.0067" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                                </Wrapper>
                                <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[327.55px] not-italic text-[14px] text-center text-nowrap text-white top-[8px] tracking-[-0.1504px] translate-x-[-50%]">Confirmar Recarga</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#fefce8] h-[54px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
                          <div aria-hidden="true" className="absolute border border-[#fff085] border-solid inset-0 pointer-events-none rounded-[10px]" />
                          <div className="absolute content-stretch flex h-[17px] items-start left-[17px] top-[18px] w-[61.594px]" data-name="Bold Text">
                            <p className="font-['Inter:Bold',sans-serif] font-bold leading-[20px] not-italic relative shrink-0 text-[#894b00] text-[14px] text-nowrap tracking-[-0.1504px]">Atenção:</p>
                          </div>
                          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[78.59px] not-italic text-[#894b00] text-[14px] text-nowrap top-[17px] tracking-[-0.1504px]">Verifique a identidade do usuário antes de confirmar pagamentos acima de R$ 100,00.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container2>
              </Wrapper2>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#030213] h-[40px] left-[1337.23px] rounded-[3.35544e+07px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] top-[907px] w-[182.766px]" data-name="Button">
        <Wrapper additionalClassNames="absolute left-[16px] top-[12px]">
          <path d={svgPaths.p15efa800} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 12H8.00667" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </Wrapper>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[107.5px] not-italic text-[14px] text-center text-nowrap text-white top-[10px] tracking-[-0.1504px] translate-x-[-50%]">Ver App Interativo</p>
      </div>
    </div>
  );
}